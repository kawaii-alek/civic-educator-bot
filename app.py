from __future__ import annotations

import logging
import os
import pickle
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Iterable, List, Literal, Sequence

import faiss
import numpy as np
import ollama
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field, validator
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@dataclass(frozen=True)
class Settings:
    """Application configuration loaded from environment variables."""

    api_key: str = field(default_factory=lambda: os.getenv("CIVIC_BOT_API_KEY", ""))
    data_dir: Path = field(
        default_factory=lambda: Path(
            os.getenv("FAISS_INDEX_DIR", Path(__file__).resolve().parent)
        )
    )
    embedding_model_name: str = field(
        default_factory=lambda: os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    )

    @property
    def index_path(self) -> Path:
        return self.data_dir / "faiss_index.idx"

    @property
    def embeddings_path(self) -> Path:
        return self.data_dir / "embeddings.pkl"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()

    if not settings.api_key:
        logger.warning(
            "Environment variable CIVIC_BOT_API_KEY is not set; requests will not be authenticated."
        )

    return settings


class VectorStore:
    """Utility class for working with the FAISS vector index."""

    def __init__(self, index_path: Path, embeddings_path: Path) -> None:
        self.index_path = index_path
        self.embeddings_path = embeddings_path
        self.index: faiss.Index | None = None
        self.documents: Sequence[str] = []

    def load(self) -> None:
        if not self.index_path.exists():
            raise FileNotFoundError(f"FAISS index not found at {self.index_path}")

        if not self.embeddings_path.exists():
            raise FileNotFoundError(f"Embeddings file not found at {self.embeddings_path}")

        self.index = faiss.read_index(str(self.index_path))
        with self.embeddings_path.open("rb") as file:
            self.documents = pickle.load(file)

        logger.info("Loaded FAISS index with %s documents", len(self.documents))

    def ready(self) -> bool:
        return bool(self.index) and bool(self.documents)

    def search(self, query_vector: np.ndarray, limit: int = 3) -> List[str]:
        if not self.ready():
            raise RuntimeError("Vector store is not ready")

        query_vector = np.asarray([query_vector], dtype="float32")
        _, indices = self.index.search(query_vector, limit)

        results: List[str] = []
        for idx in indices[0]:
            if 0 <= idx < len(self.documents):
                results.append(self.documents[idx])

        return results


settings = get_settings()
vector_store = VectorStore(settings.index_path, settings.embeddings_path)

try:
    vector_store.load()
except FileNotFoundError as error:
    logger.warning("Vector store could not be initialised: %s", error)
except Exception as error:  # pragma: no cover - defensive logging
    logger.exception("Unexpected error initialising vector store", exc_info=error)

embedding_model = SentenceTransformer(settings.embedding_model_name)


def embed_query(query: str) -> np.ndarray:
    embedding = embedding_model.encode(
        query,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    return embedding.astype("float32")


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatCompletionRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_items=1)

    @validator("messages")
    def validate_user_message(cls, messages: Iterable[ChatMessage]) -> Iterable[ChatMessage]:
        if not any(message.role == "user" for message in messages):
            raise ValueError("At least one user message is required")
        return messages

    def user_prompt(self) -> str:
        for message in reversed(self.messages):
            if message.role == "user":
                return message.content
        raise ValueError("User prompt not found")


app = FastAPI(title="Civic Bot API", version="1.0.0")


def verify_api_key(
    provided_api_key: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    if settings.api_key and provided_api_key != settings.api_key:
        raise HTTPException(status_code=403, detail="Could not validate API key")


@app.get("/v1/models")
async def get_models() -> dict:
    return {"models": ["civic-bot:latest"]}


@app.post("/v1/chat/completions")
async def chat_completion(
    payload: ChatCompletionRequest,
    _: None = Depends(verify_api_key),
) -> dict:
    if not vector_store.ready():
        raise HTTPException(status_code=503, detail="Knowledge base unavailable")

    user_message = payload.user_prompt()
    query_vector = embed_query(user_message)
    retrieved_sections = vector_store.search(query_vector)
    faiss_context = "\n\n".join(retrieved_sections) if retrieved_sections else ""

    try:
        response = ollama.chat(
            model="civic-bot:latest",
            messages=[
                {"role": "system", "content": "You are an expert on the Kenyan Constitution."},
                {"role": "user", "content": f"Context: {faiss_context}\n\nUser: {user_message}"},
            ],
        )
    except Exception as error:
        logger.exception("Failed to generate response from Ollama", exc_info=error)
        raise HTTPException(status_code=502, detail="Language model unavailable") from error

    message = response.get("message") or {}
    content = message.get("content")

    if not content:
        logger.error("Unexpected response payload from Ollama: %s", response)
        raise HTTPException(status_code=502, detail="Invalid response from language model")

    return {"content": content}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
