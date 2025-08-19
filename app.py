from fastapi import FastAPI, Request, HTTPException, Header
import faiss
import pickle
import ollama
import os
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()

API_KEY = "my_secret_key123"  # Ensure this matches OpenWebUI settings

# Set FAISS index directory
FAISS_INDEX_DIR = r"C:\Users\Chris\Documents\ALEK\DataSci\Data\Kenyan Constitution"
faiss_index_path = os.path.join(FAISS_INDEX_DIR, "faiss_index.idx")
embeddings_path = os.path.join(FAISS_INDEX_DIR, "embeddings.pkl")

try:
    index = faiss.read_index(faiss_index_path)
    with open(embeddings_path, "rb") as f:
        documents = pickle.load(f)
    print("✅ FAISS index and documents loaded successfully!")
except Exception as e:
    print(f"❌ Error loading FAISS: {e}")
    index = None
    documents = []

# Load real embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_query(query):
    return embedding_model.encode(query).tolist()

def search_faiss(query, k=3):
    """Search FAISS index for relevant constitutional sections."""
    if index is None or len(documents) == 0:
        return ["FAISS index not loaded properly."]
    
    query_vector = embed_query(query)
    D, I = index.search([query_vector], k)  # FAISS search
    retrieved_docs = [documents[i] for i in I[0] if i >= 0]
    
    return retrieved_docs if retrieved_docs else ["No relevant sections found."]

@app.get("/v1/models")
async def get_models():
    return {"models": ["civic-bot:latest"]}

@app.post("/v1/chat/completions")
async def chat_completion(request: Request, api_key: str = Header(None)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Could not validate API key")
    
    body = await request.json()
    user_message = body["messages"][-1]["content"]
    
    # 🔹 Retrieve relevant sections from FAISS
    retrieved_sections = search_faiss(user_message)
    faiss_context = " ".join(retrieved_sections)

    # 🔍 Debugging Output
    print(f"\n🔹 User Query: {user_message}")
    print(f"🔹 FAISS Retrieved Context: {faiss_context}\n")

    response = ollama.chat(model="civic-bot:latest", messages=[
        {"role": "system", "content": "You are an expert on the Kenyan Constitution."},
        {"role": "user", "content": f"Context: {faiss_context} \n\n User: {user_message}"}
    ])
    
    return {"content": response["message"]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
