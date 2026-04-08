import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """System configuration and environment variables."""
    PROJECT_NAME: str = "Civic Educator Bot"
    API_V1_STR: str = "/v1"
    
    # Internal auth
    API_KEY_LOCAL: str = "my_secret_key123"
    
    # Model settings
    CUSTOM_MODEL: str = "civic-bot:latest"
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    RAW_DATA_DIR: str = os.path.join(DATA_DIR, "raw")
    PROCESSED_DATA_DIR: str = os.path.join(DATA_DIR, "processed")
    
    FAISS_INDEX_PATH: str = os.path.join(PROCESSED_DATA_DIR, "faiss_index.idx")
    EMBEDDINGS_PKL_PATH: str = os.path.join(PROCESSED_DATA_DIR, "embeddings.pkl")

    class Config:
        env_file = ".env"

settings = Settings()
