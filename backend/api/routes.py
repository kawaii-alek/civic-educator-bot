from fastapi import APIRouter, Request, HTTPException, Header
import ollama
import logging
from typing import List, Dict, Any
from backend.core.config import settings
from backend.core.rag import rag_pipeline

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/models")
async def list_models():
    """Retrieve available models."""
    return {"models": [settings.CUSTOM_MODEL]}

@router.post("/chat/completions")
async def chat_completion(request: Request, api_key: str = Header(None)):
    """Primary chat endpoint supporting multi-turn conversation and RAG."""
    # Auth Check
    if api_key != settings.API_KEY_LOCAL:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        body = await request.json()
        messages = body.get("messages", [])
        if not messages:
            raise HTTPException(status_code=400, detail="Conversation history is empty")
        
        user_query = messages[-1]["content"]
        
        # 1. Context-Aware Retrieval
        search_query = user_query
        if len(user_query.split()) < 5 and len(messages) >= 3:
            search_query = f"{messages[-3]['content']} {user_query}"
        
        context = rag_pipeline.retrieve(search_query)
        
        # 2. Prepare LLM Instructions
        system_instruction = (
            "You are the Kenyan Civic Educator, a highly knowledgeable and professional expert "
            "on the Constitution of Kenya. Empower citizens with accurate advice. "
            "Ground your answer in the provided legal context without mentioning the context itself. "
            "Maintain continuity in dialogue.\n\n"
            f"RELEVANT CONSTITUTIONAL SECTIONS:\n{context}"
        )
        
        # Build message history for Ollama
        full_payload = [{"role": "system", "content": system_instruction}] + messages[-10:]
        
        # 3. LLM Generation
        response = ollama.chat(model=settings.CUSTOM_MODEL, messages=full_payload)
        return {"content": response["message"]["content"]}

    except Exception as e:
        logger.error(f"Chat completion error: {e}")
        return {"content": "Our legal intelligence system is momentarily unavailable. Please try again shortly."}
