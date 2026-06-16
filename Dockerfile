# Build stage for backend
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (build-essential, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source and data
COPY backend/ ./backend/
COPY data/ ./data/
COPY index_constitution.py .

# Expose backend API port
EXPOSE 8001

# Run with Gunicorn using Uvicorn worker class
CMD ["gunicorn", "-c", "backend/gunicorn_conf.py", "backend.main:app"]
