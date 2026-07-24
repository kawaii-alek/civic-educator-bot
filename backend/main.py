import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.api.routes import router as api_router
from backend.core.config import settings

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    """Application factory to initialize the FastAPI instance."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0"
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routes
    app.include_router(api_router, prefix=settings.API_V1_STR)

    # Health Check Endpoint
    @app.get("/health", tags=["System"])
    async def health_check():
        return {
            "status": "healthy",
            "project": settings.PROJECT_NAME,
            "version": "1.0.0"
        }

    # Static assets and frontend entry point
    static_dir = os.path.join(settings.BASE_DIR, "static")
    if os.path.exists(static_dir):
        app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/", include_in_schema=False)
    async def root():
        index_path = os.path.join(settings.BASE_DIR, "static", "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Civic Educator Bot API is active. Index not found."}

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port)
