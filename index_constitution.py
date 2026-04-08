import faiss
import pickle
import glob
import os
import logging
from sentence_transformers import SentenceTransformer
from backend.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def rebuild_index():
    """Builds the FAISS vector index from raw constitutional text chapters."""
    logger.info("Initializing embedding model...")
    model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
    
    # 1. Load Raw Texts
    text_files = glob.glob(os.path.join(settings.RAW_DATA_DIR, "CHAPTER*.txt"))
    if not text_files:
        logger.error(f"No chapters found in {settings.RAW_DATA_DIR}. Please check data path.")
        return

    documents = []
    logger.info(f"Processing {len(text_files)} chapters for RAG pipeline...")
    
    for file_path in text_files:
        chapter_name = os.path.basename(file_path).replace(".txt", "")
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            # Chunking logic for dense legal documents
            chunks = [p.strip() for p in content.split("\n\n") if len(p.strip()) > 50]
            for chunk in chunks:
                documents.append(f"[{chapter_name}] {chunk}")

    logger.info(f"Created {len(documents)} document chunks.")

    # 2. Vectorization
    logger.info("Generating semantic embeddings...")
    embeddings = model.encode(documents)

    # 3. Vector Database Persistent
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    # Ensure processed directory exists
    os.makedirs(settings.PROCESSED_DATA_DIR, exist_ok=True)

    # 4. Storage
    faiss.write_index(index, settings.FAISS_INDEX_PATH)
    with open(settings.EMBEDDINGS_PKL_PATH, "wb") as f:
        pickle.dump(documents, f)

    logger.info("RAG Pipeline built successfully. System optimized for retrieval.")

if __name__ == "__main__":
    rebuild_index()
