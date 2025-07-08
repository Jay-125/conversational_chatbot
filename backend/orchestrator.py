from langchain_community.llms import Ollama
# from langchain_tavily import TavilySearch
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.document_loaders import PyPDFLoader
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda
from langgraph_supervisor import create_supervisor
from langgraph.checkpoint.memory import MemorySaver
from langgraph_supervisor import agent_name
from langgraph.graph import StateGraph, END
from typing import Optional, TypedDict

# -----------------------------
# LLM: Using Ollama
# llm = Ollama(model="gemma")
# llm = Ollama(model="llama3:8b")
llm = Ollama(model="tinyllama:1.1b")

# -----------------------------
# Embeddings + Chroma Setup (for RAG)
modelPath = "sentence-transformers/all-MiniLM-l6-v2"
encode_kwargs = {'normalize_embeddings': False}
embeddings = HuggingFaceEmbeddings(model_name=modelPath, encode_kwargs=encode_kwargs)

pdf_paths = [
    "D:\hackathon\\backend\company_info.pdf",
]
docs = []
for path in pdf_paths:
    docs.extend(PyPDFLoader(path).load_and_split())

vectordb = Chroma.from_documents(docs, embeddings)
retriever = vectordb.as_retriever()

# -----------------------------
# Web Search Tool: DuckDuckGo (no API key needed)
duckduckgo = DuckDuckGoSearchRun()

def search_web(query: str) -> str:
    results = duckduckgo.run(query)
    return results if results else "No relevant results found."

# -----------------------------
# Prompts

web_prompt_template = PromptTemplate.from_template("""
You are a real-time web assistant with access to live information via a search tool.

Steps:
1. Read the user query.
2. If it requires recent or live information (e.g., weather, news, current events), use the web.
3. Use the output from search to form a clear response.

User Query: {query}
""")

rag_prompt_template = PromptTemplate.from_template("""
You are a company assistant with access to internal PDF documents about the company.

Steps:
1. Read the user query.
2. Use your internal knowledge base to retrieve the most relevant document chunk.
3. Summarize the key content clearly.

User Query: {query}
""")

class AgentState(TypedDict):
    input: str
    output: Optional[str] = None

# -----------------------------
# Manual Agent: WebAgent
# def web_agent_func(data: dict) -> dict:
#     query = data["input"]
#     prompt = web_prompt_template.format(query=query)
#     web_result = search_web(query)
#     response = llm.invoke(f"{prompt}\n\nWeb Search Result:\n{web_result}")
#     return {"output": response}

def web_agent(data: AgentState) -> AgentState:
    query = data["input"]
    prompt = web_prompt_template.format(query=query)
    web_result = search_web(query)
    response = llm.invoke(f"{prompt}\n\nWeb Search Result:\n{web_result}")
    return {"input": query, "output": response}


# def web_agent(AgentState) -> str:
#     web_agent = RunnableLambda(web_agent_func)
#     return web_agent

# -----------------------------
# Manual Agent: RAGAgent
# def rag_agent_func(data: dict) -> dict:
#     query = data["input"]
#     prompt = rag_prompt_template.format(query=query)
#     docs = retriever.invoke(query)
#     doc_content = docs[0].page_content if docs else "No relevant content found."
#     response = llm.invoke(f"{prompt}\n\nCompany Document Snippet:\n{doc_content}")
#     return {"output": response}

# def rag_agent(AgentState) -> str:
#     rag_agent = RunnableLambda(rag_agent_func)
#     return rag_agent

def rag_agent(data: AgentState) -> AgentState:
    query = data["input"]
    prompt = rag_prompt_template.format(query=query)
    docs = retriever.invoke(query)
    doc_content = docs[0].page_content if docs else "No relevant content found."
    response = llm.invoke(f"{prompt}\n\nCompany Document Snippet:\n{doc_content}")
    return {"input": query, "output": response}

# -----------------------------
# Memory (Thread-scoped)
memory = MemorySaver()

# ----------------------
# Routing Logic
def decide_agent(AgentState):
    query = AgentState["input"].lower()

    if any(word in query for word in ["today", "latest", "current", "now", "news", "live", "weather", "price"]):
        return {"next": "web"}
    return {"next": "rag"}

# ----------------------
# LangGraph Setup

# ----------------------
# Memory
memory = MemorySaver()


# Build the graph
builder = StateGraph(AgentState)

# Add nodes
builder.add_node("orchestrator", decide_agent)
builder.add_node("web", web_agent)
builder.add_node("rag", rag_agent)

builder.set_entry_point("orchestrator")

# Add decision routing
builder.add_conditional_edges("orchestrator", lambda x: x["next"], {
    "web": "web",
    "rag": "rag"
})

# Final edge
builder.add_edge("web", END)
builder.add_edge("rag", END)

# Finalize graph
graph = builder.compile()



# ----------------------
# Entrypoint for FastAPI
def get_response(user_input: str, thread_id: str = "notebook-thread") -> str:
    result = graph.invoke({"input": user_input}, config={"thread_id": thread_id, "checkpoint": memory})
    return result.get("output", "Sorry, no response generated.")