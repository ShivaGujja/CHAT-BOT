# Interas Labs RAG Chatbot

This project is a **Retrieval-Augmented Generation (RAG) chatbot** designed to serve as an intelligent, company-specific virtual assistant for **Interas Labs**.  
It combines **FastAPI**, **LangChain**, and **Ollama** to deliver accurate, context-aware responses based on company data.

---

## 🏢 About Interas Labs
Interas Labs is a **California-based technology company** founded in **2015 by Ujwal Reddy**.  
We specialize in **AI-driven solutions, DevOps automation, cloud engineering, and full-stack application development**.  


- **Website:** [www.interaslabs.com](https://www.interaslabs.com)  


---

## 🚀 Features
- **RAG-based Question Answering**: Fetches precise answers from company knowledge documents.  
- **FastAPI Backend**: A lightweight and scalable API for handling chatbot requests.  
- **LangChain + FAISS Integration**: For document chunking, vector search, and efficient retrieval.  
- **Ollama Mistral LLM**: Runs locally for secure and private inference.  
- **React Frontend**: Interactive chat interface for seamless user experience.  
- **Custom Branding**: Chatbot is styled and branded for Interas Labs.

---

## 🛠️ Tech Stack
- **Backend**: Python, FastAPI, LangChain, Ollama  
- **Vector Store**: FAISS (In-memory index)  
- **Frontend**: React (Tailored chat UI)  
- **Model**: Mistral (via Ollama)

---

## 📂 Project Structure
├── Backend/
│ ├── chatbot_api.py # Main FastAPI application
│ ├── RAGdoc1/data/ # Knowledge documents for embeddings
│ └── ... # Supporting files
├── Frontend/ # React chat application
└── README.md # Project documentation
