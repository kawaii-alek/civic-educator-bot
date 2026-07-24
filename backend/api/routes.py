from fastapi import APIRouter, Request, HTTPException, Header
import google.generativeai as genai
import logging
from typing import List, Dict, Any
from backend.core.config import settings
from backend.core.rag import rag_pipeline

router = APIRouter()
logger = logging.getLogger(__name__)

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not configured in settings/environment variables.")

def get_english_search_query(user_query: str, language: str) -> str:
    """Translate user query to English search terms if language is not English."""
    if language == "English":
        return user_query
    try:
        translation_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        prompt = (
            f"You are a translation assistant. Translate the following Kenyan user query "
            f"(which might be in {language}, Swahili, Sheng, or mixed) into English for the purpose "
            f"of searching a legal document. Return ONLY the translated English text, without any "
            f"introductory or concluding remarks.\n\nQuery: {user_query}"
        )
        response = translation_model.generate_content(prompt)
        translated = response.text.strip()
        logger.info(f"Translated query: '{user_query}' -> '{translated}'")
        return translated
    except Exception as e:
        logger.error(f"Failed to translate query to English: {e}")
        return user_query

@router.get("/models")
async def list_models():
    """Retrieve available models."""
    return {"models": [settings.GEMINI_MODEL]}

@router.post("/chat/completions")
async def chat_completion(request: Request, api_key: str = Header(None)):
    """Primary chat endpoint supporting multi-turn conversation, RAG, and multilingual translation."""
    # Auth Check
    if api_key != settings.API_KEY_LOCAL:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API Key is not configured. Please set GEMINI_API_KEY in the .env file."
        )
    
    try:
        body = await request.json()
        messages = body.get("messages", [])
        language = body.get("language", "English")
        if not messages:
            raise HTTPException(status_code=400, detail="Conversation history is empty")
        
        user_query = messages[-1]["content"]
        
        # 1. Context-Aware Retrieval with query translation
        raw_search_query = user_query
        if len(user_query.split()) < 5 and len(messages) >= 3:
            raw_search_query = f"{messages[-3]['content']} {user_query}"
        
        search_query = get_english_search_query(raw_search_query, language)
        context = rag_pipeline.retrieve(search_query)
        
        # 2. Prepare LLM Instructions
        system_instruction = (
            "You are the Kenyan Civic Educator, a highly knowledgeable and professional expert "
            "on the Constitution of Kenya. Empower citizens with accurate advice. "
            "Ensure that your explanations are well thought out, clear, and easy to understand "
            "for a layperson, while preserving exact legal meanings. "
            "Ground your answer in the provided legal context without mentioning the context itself. "
            "Maintain continuity in dialogue.\n\n"
            f"RELEVANT CONSTITUTIONAL SECTIONS:\n{context}"
        )
        
        if language != "English":
            system_instruction += (
                f"\n\nCRITICAL: The citizen is asking in {language}. You MUST translate your response "
                f"and answer them entirely in fluent {language}. "
                f"Ensure your translation is semantically and grammatically correct in {language}, "
                f"avoiding literal translations of English idioms. Use standard spelling, natural phrasing, "
                f"and culturally appropriate legal equivalents in {language}. "
                f"If they code-switch or use Sheng/mixed language, you may respond in a friendly and accessible "
                f"manner in the requested language while maintaining strict grammatical consistency and professional legal accuracy."
            )
        
        # Build message history for Gemini (roles must map to 'user' or 'model')
        contents = []
        for msg in messages[-10:]:
            role = msg.get("role")
            content_text = msg.get("content", "")
            
            # Map frontend roles to Gemini roles
            gemini_role = "user" if role in ("user", "User") else "model"
            contents.append({
                "role": gemini_role,
                "parts": [content_text]
            })
        
        # 3. LLM Generation using Gemini
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=system_instruction
        )
        
        response = model.generate_content(contents)
        
        try:
            reply = response.text
        except ValueError:
            reply = "I'm sorry, but I cannot generate a response due to safety settings or empty content."
            
        return {"content": reply}

    except Exception as e:
        logger.error(f"Chat completion error: {e}")
        return {"content": "Our legal intelligence system is momentarily unavailable. Please try again shortly."}
