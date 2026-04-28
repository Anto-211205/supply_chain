from fastapi import APIRouter
from services.gemini_service import chat_with_gemini, analyze_with_gemini

router = APIRouter()

# Chat endpoint
@router.post("/chat")
async def chat(data: dict):
    message = data.get("message")
    context = data.get("context", {})
    history = data.get("history", [])

    result = await chat_with_gemini(message, context, history)
    return result


# Analysis endpoint
@router.post("/analyze")
async def analyze(data: dict):
    analysis_type = data.get("type")
    payload = data.get("data", {})

    result = await analyze_with_gemini(analysis_type, payload)
    return result