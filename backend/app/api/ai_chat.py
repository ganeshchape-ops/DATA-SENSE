from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.db_models import User, ChatSession, ChatMessage
from backend.app.schemas.api_schemas import AIChatRequest, AIChatResponse, ChatMessageSchema
from backend.app.services.chat_service import process_chat_message
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Data Chat"])

@router.post("/message", response_model=AIChatResponse)
def send_chat_message(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send natural language query about the dataset to AI assistant."""
    session_id, answer, suggested_queries, related_metrics = process_chat_message(
        db=db,
        user_id=current_user.id,
        dataset_id=req.dataset_id,
        message=req.message,
        session_id=req.session_id
    )

    return AIChatResponse(
        session_id=session_id,
        message=answer,
        sender="ai",
        suggested_queries=suggested_queries,
        related_metrics=related_metrics
    )

@router.get("/history/{dataset_id}", response_model=List[ChatMessageSchema])
def get_chat_history(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve message history for a given dataset conversation."""
    session = db.query(ChatSession).filter(
        ChatSession.dataset_id == dataset_id,
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).first()

    if not session:
        return []

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at.asc()).all()

    return messages

@router.delete("/clear/{dataset_id}")
def clear_chat_history(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear conversation history for a dataset."""
    sessions = db.query(ChatSession).filter(
        ChatSession.dataset_id == dataset_id,
        ChatSession.user_id == current_user.id
    ).all()

    for s in sessions:
        db.delete(s)
    db.commit()

    return {"success": True, "message": "Conversation history cleared."}
