from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_community.vectorstores import InMemoryVectorStore

file_path = r"C:/Internship_prep/RAG/RAGdoc1/data/inter.txt"
loader = TextLoader(file_path)
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=200, add_start_index=True
)
all_splits = text_splitter.split_documents(docs)

embeddings = OllamaEmbeddings(model="mistral")
vector_store = InMemoryVectorStore(embeddings)
vector_store.add_documents(all_splits)

llm = OllamaLLM(model="mistral")

print("🤖 InterasLabs Doc Chat (Mistral via Ollama)")
print("Type your question. Type ':q' to quit, ':clear' to reset history.\n")

while True:
    query = input("You: ")
    
    if query.strip().lower() == ":q":
        print("Exiting chat. Bye 👋")
        break
    
    if not query.strip():
        continue

    # Retrieve top 4 docs
    results = vector_store.similarity_search_with_score(query, k=4)
    context = "\n\n".join([doc.page_content for doc, _ in results])

    # Build prompt
    prompt = f"""
    act as a chat bot for a website
    You are an assistant with knowledge about Interas Labs.
    Use only the context below to answer.

    Context:
    {context}

    Question: {query} ignore the context if the "Question" is general 

    Answer in one clear, most specific and minimal response.
    and answer should be in a single sentence.
    improvise the vocabulary
    
   
    """

    # Get response from Ollama
    response = llm.invoke(prompt)

    print(f"\nAI: {response}\n")