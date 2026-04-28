"""
Chatbot API route — thin layer delegating to chatbot_service.
"""

from fastapi import APIRouter

from backend.models.chat import ChatRequest
from backend.services.chatbot_service import chatbot_reply

router = APIRouter()


@router.post("/chatbot/ask")
def ask_chatbot(payload: ChatRequest):
    """
    POST /api/v1/chatbot/ask

    Accept a natural-language question and return a professional
    AI-powered operations assistant response.
    """
    try:
        return chatbot_reply(
            message=payload.message,
            session_id=payload.session_id,
        )
    except Exception as exc:
        return {
            "status": "error",
            "message": f"Chatbot route error: {exc}",
        }
