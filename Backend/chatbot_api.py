import os
from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_ollama import ChatOllama


app = FastAPI(
    title="InterasLabs RAG Chatbot API",
    description="Chatbot backend for Interas Labs website.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# 2. Load company data
# --------------------
try:
    script_dir = Path(__file__).parent
    file_path = script_dir / "RAGdoc1" / "data" / "inter.txt"

    loader = TextLoader(str(file_path), encoding="utf-8")
    docs = loader.load()
except FileNotFoundError:
    raise RuntimeError(f"❌ ERROR: inter.txt not found at {file_path}. Check file path!")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=200, add_start_index=True
)
all_splits = text_splitter.split_documents(docs)

embeddings = OllamaEmbeddings(model="mistral")
vector_store = InMemoryVectorStore(embeddings)
vector_store.add_documents(all_splits)

llm = ChatOllama(model="mistral")


response_cache = {}  

class Query(BaseModel):
    question: str


def get_rag_response(question: str) -> str:
    """Searches vector store and generates a concise answer, with caching."""

    if question.lower() in response_cache:
        print(f"⚡ Cache hit for: {question}")
        return response_cache[question.lower()]

    
    results = vector_store.similarity_search(question, k=3)
    context = "\n".join([doc.page_content for doc in results])

    prompt = f"""
You are a Q&A system for Interas Labs. 
Rules:
- ONLY use information from the context to answer.
- If the question is out of context or has no answer in the context, say: "I don't have information on that."
- Do NOT include greetings, politeness, or extra commentary.
- Reply in ONE factual, concise sentence only.
- 

Context:
{context}

Detect the language in which the question is
Question:
{question}

Answer in same language detected in question in a clear, single sentence.
    """

    answer = llm.invoke(prompt)
    final_answer = answer.content if hasattr(answer, "content") else str(answer)

    
    response_cache[question.lower()] = final_answer
    print(f"✅ Cached response for: {question}")

    return final_answer


@app.post("/chat")
def chat_post(query: Query):
    """Frontend sends a POST request with JSON {question: "..."}"""
    answer = get_rag_response(query.question)
    return {"answer": answer}

@app.get("/")
def home():
    return {"message": "InterasLabs RAG Chatbot API is running 🚀"}