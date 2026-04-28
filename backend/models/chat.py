from typing import List, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming chatbot request with optional conversation context."""

    message: str = Field(..., min_length=1, description="User's natural language query")
    session_id: Optional[str] = Field(
        default=None,
        description="Session identifier for maintaining conversation context",
    )


class ChatResponse(BaseModel):
    """Structured chatbot response."""

    status: str = Field(..., description="Response status: success or error")
    message: str = Field(..., description="Professional response text")
    intents_detected: Optional[List[str]] = Field(
        default=None,
        description="Intents identified from the user query",
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session ID for follow-up context",
    )