import time
import logging
from typing import List, Dict, Any
from collections import defaultdict

from fastapi import APIRouter, Request, HTTPException, Header, Depends
from pydantic import BaseModel, Field
from ollama import Client as OllamaClient
from httpx import ConnectError, TimeoutException, RequestError
import google.generativeai as genai

from backend.core.config import settings
from backend.core.rag import rag_pipeline

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Pydantic Models ---

class MessageModel(BaseModel):
    role: str = Field(..., description="Role of the message author (system, user, assistant, bot)")
    content: str = Field(..., description="The content of the message")

class ChatCompletionRequest(BaseModel):
    messages: List[MessageModel] = Field(..., min_length=1, description="List of messages representing conversation history")

class ChatCompletionResponse(BaseModel):
    content: str = Field(..., description="The generated response from the AI assistant")

# --- In-Memory Rate Limiter ---

class RateLimiter:
    def __init__(self, limit: int, window: int):
        self.limit = limit
        self.window = window
        self.requests = defaultdict(list)

    def check_rate_limit(self, client_ip: str):
        now = time.time()
        # Filter out requests older than the window
        self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < self.window]
        
        if len(self.requests[client_ip]) >= self.limit:
            raise HTTPException(
                status_code=429, 
                detail="Too many requests. Please try again later."
            )
        
        self.requests[client_ip].append(now)

limiter = RateLimiter(limit=settings.RATE_LIMIT_LIMIT, window=settings.RATE_LIMIT_WINDOW)

async def rate_limit_dependency(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    limiter.check_rate_limit(client_ip)

# --- Ollama Client Setup ---

ollama_client = OllamaClient(
    host=settings.OLLAMA_HOST,
    timeout=settings.OLLAMA_TIMEOUT
)

def ollama_chat_with_retry(model: str, messages: List[Dict[str, str]], retries: int = 3, delay: float = 1.0):
    last_exception = None
    for attempt in range(retries):
        try:
            return ollama_client.chat(model=model, messages=messages)
        except (ConnectError, TimeoutException, RequestError, Exception) as e:
            logger.warning(f"Ollama connection attempt {attempt + 1} failed: {e}")
            last_exception = e
            if attempt < retries - 1:
                time.sleep(delay * (2 ** attempt)) # exponential backoff
    
    logger.error(f"Failed to communicate with Ollama after {retries} attempts. Error: {last_exception}")
    raise HTTPException(
        status_code=503, 
        detail=f"Our legal intelligence system is momentarily unavailable. (LLM service error: {last_exception})"
    )

# --- Gemini API Client Setup ---

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def gemini_chat_with_retry(messages: List[Dict[str, str]], system_instruction: str, retries: int = 3, delay: float = 1.0) -> str:
    # Map roles: 'bot'/'assistant' -> 'model', 'user' -> 'user'
    # Use last 10 messages for conversation context
    history_window = messages[-10:] if len(messages) > 10 else messages
    
    # Extract the latest user query
    user_query = history_window[-1]["content"]
    
    # Build history for Gemini
    gemini_history = []
    for msg in history_window[:-1]:
        role = "user" if msg["role"] == "user" else "model"
        gemini_history.append({
            "role": role,
            "parts": [msg["content"]]
        })
        
    last_exception = None
    for attempt in range(retries):
        try:
            model = genai.GenerativeModel(
                model_name=settings.GEMINI_MODEL,
                system_instruction=system_instruction
            )
            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(user_query)
            return response.text
        except Exception as e:
            logger.warning(f"Gemini API connection attempt {attempt + 1} failed: {e}")
            last_exception = e
            if attempt < retries - 1:
                time.sleep(delay * (2 ** attempt)) # exponential backoff
                
    logger.error(f"Failed to communicate with Gemini after {retries} attempts. Error: {last_exception}")
    raise last_exception

def is_swahili(text: str, lang_header: str = None) -> bool:
    if lang_header and lang_header.lower() in ("sw", "swahili"):
        return True
    swahili_keywords = {
        "haki", "sheria", "katiba", "uhuru", "kenya", "mambo", "nchi", "wananchi", 
        "serikali", "ulinzi", "usalama", "uraia", "rais", "bunge", "mahakama", "habari",
        "jambo", "kazi", "mtu", "watu", "mungu", "swahili", "kiswahili", "na", "ya", "wa",
        "kwa", "katika", "ni", "cha", "za", "la", "kama", "hata", "lakini", "hapa", "pale"
    }
    words = set(text.lower().split())
    return len(words.intersection(swahili_keywords)) >= 1

def get_language_name(lang_code: str) -> str:
    mapping = {
        "en": "English",
        "sw": "Kiswahili",
        "swahili": "Kiswahili",
        "kikuyu": "Gikuyu (Kikuyu)",
        "luo": "Dholuo (Luo)",
        "luhya": "Luhya",
        "kamba": "Kamba",
        "kalenjin": "Kalenjin",
        "somali": "Somali"
    }
    return mapping.get(lang_code.lower().strip(), lang_code.capitalize())

def translate_to_en(query: str, from_lang: str) -> str:
    if not settings.GEMINI_API_KEY:
        return query
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        prompt = f"Translate the following {from_lang} query into a search-optimized English query: {query}"
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Failed to translate query from {from_lang} to English via Gemini: {e}")
        return query

# --- Search Models ---

class SearchResultModel(BaseModel):
    results: List[str] = Field(..., description="List of relevant constitutional sections retrieved from the database")

# --- Routes ---

@router.get("/models")
async def list_models():
    """Retrieve available models."""
    return {"models": [settings.CUSTOM_MODEL, settings.GEMINI_MODEL]}

@router.get("/search", response_model=SearchResultModel)
async def search_constitution(q: str, x_language: str = Header(None, alias="x-language")):
    """Retrieve relevant constitutional sections directly from the vector index."""
    if not q.strip():
        return SearchResultModel(results=[])
    
    lang_code = x_language.lower().strip() if x_language else ""
    if not lang_code:
        lang_code = "sw" if is_swahili(q) else "en"
        
    is_english = lang_code in ("en", "english")
    search_query = q
    if not is_english and settings.GEMINI_API_KEY:
        lang_name = get_language_name(lang_code)
        search_query = translate_to_en(q, lang_name)
        logger.info(f"Translated search query from '{q}' ({lang_name}) to '{search_query}'")
        
    # Retrieve matching chunks
    context = rag_pipeline.retrieve(search_query, k=8)
    
    # Split by the double newlines to return them as individual results
    results = [chunk.strip() for chunk in context.split("\n\n") if chunk.strip()]
    return SearchResultModel(results=results)

@router.post(
    "/chat/completions",
    response_model=ChatCompletionResponse,
    dependencies=[Depends(rate_limit_dependency)]
)
async def chat_completion(
    request_body: ChatCompletionRequest,
    api_key: str = Header(None, alias="api-key"),
    x_language: str = Header(None, alias="x-language")
):
    """Primary chat endpoint supporting multi-turn conversation and RAG."""
    # Auth Check (401 Unauthorized for missing/invalid keys)
    if not api_key:
        raise HTTPException(status_code=401, detail="API Key header 'api-key' is missing")
    if api_key != settings.API_KEY_LOCAL:
        raise HTTPException(status_code=401, detail="Unauthorized access: Invalid API Key")
    
    # 1. Context-Aware Retrieval
    # Extract messages as raw dicts
    messages = [{"role": msg.role, "content": msg.content} for msg in request_body.messages]
    
    user_query = messages[-1]["content"]
    
    # Language Check (Header or Detect)
    lang_code = x_language.lower().strip() if x_language else ""
    if not lang_code:
        lang_code = "sw" if is_swahili(user_query) else "en"
        
    is_english = lang_code in ("en", "english")
    lang_name = get_language_name(lang_code)
    
    # Context-aware query expansion for search
    search_query = user_query
    if len(user_query.split()) < 5 and len(messages) >= 3:
        # If short query, append previous user content if available
        search_query = f"{messages[-3]['content']} {user_query}"
    
    # Translate query to English if not English and Gemini key configured
    if not is_english and settings.GEMINI_API_KEY:
        translated_query = translate_to_en(search_query, lang_name)
        logger.info(f"Translated query '{search_query}' ({lang_name}) to English: '{translated_query}'")
        search_query = translated_query
        
    context = rag_pipeline.retrieve(search_query)
    
    # 2. Prepare LLM Instructions
    system_instruction = (
        "You are the Kenyan Civic Educator, a highly knowledgeable and professional expert "
        "on the Constitution of Kenya. Empower citizens with accurate advice. "
        "Ground your answer in the provided legal context without mentioning the context itself. "
        "Maintain continuity in dialogue.\n\n"
        f"RELEVANT CONSTITUTIONAL SECTIONS:\n{context}"
    )
    if not is_english:
        system_instruction += f"\n\nPlease provide your final answer in {lang_name}. Ground it on the retrieved English context."
    
    # Map frontend roles to Ollama supported roles (bot -> assistant)
    mapped_history = []
    for msg in messages:
        role = msg["role"]
        if role == "bot":
            role = "assistant"
        mapped_history.append({"role": role, "content": msg["content"]})
    
    # Build message history for Ollama (last 10 messages)
    full_payload = [{"role": "system", "content": system_instruction}] + mapped_history[-10:]
    
    # 3. LLM Generation
    response_content = ""
    llm_success = False
    
    # Try Gemini first if key exists
    if settings.GEMINI_API_KEY:
        try:
            logger.info("Attempting generation via Gemini API...")
            response_content = gemini_chat_with_retry(
                messages=messages,
                system_instruction=system_instruction,
                retries=settings.OLLAMA_RETRIES
            )
            llm_success = True
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}. Trying Ollama next...")
            
    # Try Ollama if Gemini wasn't attempted or failed
    if not llm_success:
        try:
            logger.info("Attempting generation via local Ollama...")
            response = ollama_chat_with_retry(
                model=settings.CUSTOM_MODEL,
                messages=full_payload,
                retries=settings.OLLAMA_RETRIES
            )
            response_content = response["message"]["content"]
            llm_success = True
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}.")
            
    # If both failed or are unavailable, use the offline RAG fallback
    if not llm_success:
        logger.warning("All LLM services are offline/unavailable. Falling back to raw RAG context.")
        if lang_code == "sw":
            if context.strip():
                response_content = (
                    "⚖️ **[Njia ya Nje ya Mtandao]** Mfumo wetu wa akili ya kisheria haupatikani kwa sasa. "
                    "Hata hivyo, hapa kuna sehemu muhimu zaidi zilizopatikana moja kwa moja kutoka kwa Katiba ya Kenya:\n\n"
                    f"{context}\n\n"
                    "*Kumbuka: Inaonyesha vifungu vya katiba moja kwa moja kwa sababu ya hitilafu ya mtandao.*"
                )
            else:
                response_content = (
                    "⚖️ **[Njia ya Nje ya Mtandao]** Mfumo wetu wa akili ya kisheria haupatikani kwa sasa. "
                    "Hakuna vifungu vya katiba vinavyolingana na ombi hili vilivyopatikana kwenye hifadhi ya data ya ndani."
                )
        else:
            if context.strip():
                response_content = (
                    "⚖️ **[Offline Search Mode]** Our legal intelligence system is momentarily offline. "
                    "However, here are the most relevant sections retrieved directly from the Constitution of Kenya:\n\n"
                    f"{context}\n\n"
                    "*Note: Showing direct constitutional provisions due to system connectivity fallback.*"
                )
            else:
                response_content = (
                    "⚖️ **[Offline Search Mode]** Our legal intelligence system is momentarily offline. "
                    "No matching constitutional provisions were found for this query in the local database."
                )
            
    return ChatCompletionResponse(content=response_content)

