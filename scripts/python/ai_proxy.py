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
client = None


@app.on_event("startup")
def startup_event():
    global client
    try:
        client = get_client()
    except Exception as e:
        raise RuntimeError(f"AI proxy failed to initialize: {e}")


@app.post("/chat")
def chat(req: ChatRequest):
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
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8765"))
    uvicorn.run(app, host=host, port=port)
