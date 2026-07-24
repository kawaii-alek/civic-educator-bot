import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """System configuration and environment variables."""
    PROJECT_NAME: str = "Civic Educator Bot"
    API_V1_STR: str = "/v1"
    
    # Internal auth
    API_KEY_LOCAL: str = ""
    
    # CORS Origins (comma-separated list of allowed origins)
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3008"
    
    # Model settings
    CUSTOM_MODEL: str = "civic-bot:latest"
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # Gemini API settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # Ollama settings
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_TIMEOUT: float = 5.0
    OLLAMA_RETRIES: int = 2
    
    # Rate Limiting
    RATE_LIMIT_LIMIT: int = 60  # max requests per window
    RATE_LIMIT_WINDOW: int = 60  # window size in seconds
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    RAW_DATA_DIR: str = os.path.join(DATA_DIR, "raw")
    PROCESSED_DATA_DIR: str = os.path.join(DATA_DIR, "processed")
    
    FAISS_INDEX_PATH: str = os.path.join(PROCESSED_DATA_DIR, "faiss_index.idx")
    EMBEDDINGS_PKL_PATH: str = os.path.join(PROCESSED_DATA_DIR, "embeddings.pkl")

    class Config:
        env_file = ".env"
        extra = "ignore"

    def __init__(self, **values):
        super().__init__(**values)
        if os.getenv("ENV") == "production":
            if not self.API_KEY_LOCAL or self.API_KEY_LOCAL == "my_secret_key123":
                raise ValueError("API_KEY_LOCAL must be set to a secure, non-default value in production.")

settings = Settings()

