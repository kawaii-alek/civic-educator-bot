import multiprocessing
import os

# Gunicorn configuration file for FastAPI/Uvicorn ASGI application
bind = os.getenv("BIND", "0.0.0.0:8001")
workers = int(os.getenv("WORKERS", multiprocessing.cpu_count() * 2 + 1))
worker_class = "uvicorn.workers.UvicornWorker"

# Logging
loglevel = os.getenv("LOG_LEVEL", "info")
accesslog = "-"
errorlog = "-"

# Process management
keepalive = 5
timeout = 120
graceful_timeout = 120
