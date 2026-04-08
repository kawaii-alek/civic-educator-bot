import faiss
import pickle
import os
import logging
from typing import List, Tuple
from sentence_transformers import SentenceTransformer
from backend.core.config import settings

logger = logging.getLogger(__name__)

class RAGPipeline:
    """Manages the Retrieval-Augmented Generation context and vector search."""
    
    def __init__(self):
        self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        self.index = None
        self.documents = []
        self._load_resources()

    def _load_resources(self):
        """Load FAISS index and document mappings from disk."""
        try:
            if os.path.exists(settings.FAISS_INDEX_PATH):
                self.index = faiss.read_index(settings.FAISS_INDEX_PATH)
                with open(settings.EMBEDDINGS_PKL_PATH, "rb") as f:
                    self.documents = pickle.load(f)
                logger.info(f"RAG Resources loaded successfully from {settings.PROCESSED_DATA_DIR}")
            else:
                logger.warning(f"RAG Index not found at {settings.FAISS_INDEX_PATH}. Please run indexing.")
        except Exception as e:
            logger.error(f"Failed to load RAG resources: {e}")

    def retrieve(self, query: str, k: int = 7) -> str:
        """Search the vector database for relevant constitutional sections."""
        if self.index is None or not self.documents:
            return ""
        
        try:
            query_vector = self.embedding_model.encode([query])
            _, indices = self.index.search(query_vector, k)
            
            retrieved_chunks = []
            for idx in indices[0]:
                if 0 <= idx < len(self.documents):
                    retrieved_chunks.append(self.documents[idx])
            
            return "\n\n".join(retrieved_chunks)
        except Exception as e:
            logger.error(f"Search retrieval failed: {e}")
            return ""

# Singleton instance
rag_pipeline = RAGPipeline()
