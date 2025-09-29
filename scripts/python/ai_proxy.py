#!/usr/bin/env python3
"""
Lightweight AI proxy for per-page chat using GitHub Models (Azure AI Inference).

Usage (dev only):
  uv run python scripts/python/ai_proxy.py

Env vars:
  GITHUB_TOKEN  - required (a PAT with models access)
  AI_MODEL      - optional (default: deepseek/DeepSeek-R1)
  AI_ENDPOINT   - optional (default: https://models.github.ai/inference)
  HOST, PORT    - optional (default: 127.0.0.1:8765)
"""
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
import uvicorn


class ChatRequest(BaseModel):
    question: str
    context: str
    model: Optional[str] = None
    max_tokens: int = 800


def get_client() -> ChatCompletionsClient:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN is not set")
    endpoint = os.environ.get("AI_ENDPOINT", "https://models.github.ai/inference")
    return ChatCompletionsClient(endpoint=endpoint, credential=AzureKeyCredential(token))


app = FastAPI()

# CORS: support Codespaces domains and localhost by default; configurable via PROXY_CORS_ORIGIN_REGEX
cors_regex = os.environ.get(
    "PROXY_CORS_ORIGIN_REGEX",
    r"^https?://(localhost|127\.0\.0\.1)(:\\d+)?$|^https://.*\\.app\\.github\\.dev$",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],  # use regex below
    allow_origin_regex=cors_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
client = None
client_error: Optional[str] = None


@app.on_event("startup")
def startup_event():
    global client, client_error
    try:
        client = get_client()
        client_error = None
    except Exception as e:
        # Don't crash the server; keep running and return a clear error on /chat
        client = None
        client_error = str(e)


@app.get("/health")
def health():
    return {"ok": client is not None, "error": client_error}


@app.post("/chat")
def chat(req: ChatRequest):
    # Surface configuration error at request time
    if client is None:
        raise HTTPException(status_code=503, detail=f"AI proxy not ready: {client_error or 'missing GITHUB_TOKEN'}")
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="question is required")

    model = req.model or os.environ.get("AI_MODEL", "deepseek/DeepSeek-R1")

    system_prompt = (
        "You are a helpful documentation assistant. Only answer using the given page content. "
        "If the answer cannot be found in the content, say you don't know. Keep answers concise."
    )

    try:
        response = client.complete(
            messages=[
                SystemMessage(system_prompt),
                UserMessage(f"Page content:\n{req.context}\n\nQuestion: {req.question}")
            ],
            model=model,
            max_tokens=req.max_tokens,
        )
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Bind to all interfaces by default so Codespaces/containers can forward the port
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8765"))
    uvicorn.run(app, host=host, port=port)
