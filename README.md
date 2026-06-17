# Civic Educator Bot

A professional Retrieval-Augmented Generation (RAG) platform designed to provide expert civic education on the Constitution of Kenya.

## Architecture
- **Backend**: FastAPI with a modular, scalable structure.
- **RAG Engine**: FAISS (Vector DB) + SentenceTransformers (Embeddings).
- **LLM**: Local-first intelligence via Ollama (`civic-bot:latest`).
- **Frontend**: Next.js 15+ with a clean, institutional design.

## Repository Structure
```text
├── backend/            # Python backend source code
│   ├── api/            # API routes and controllers
│   ├── core/           # Core logic, config, and RAG engine
│   └── main.py         # Application entry point
├── data/               # Project data
│   ├── raw/            # Raw constitutional text chapters
│   └── processed/      # FAISS indices and document clusters
├── docs/               # Project documentation
├── frontend/           # Next.js 15+ Web Dashboard
└── index_constitution.py # Data ingestion pipeline
```

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 20+
- Ollama (running locally with `civic-bot` model)

### 2. Backend Setup
```bash
pip install -r requirements.txt
python index_constitution.py  # Build the FAISS index
python -m backend.main        # Start the API on port 8001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- -p 3008        # Start portal on port 3008
```

## Legal Disclaimer
This bot is for educational purposes only and does not constitute legal advice.
