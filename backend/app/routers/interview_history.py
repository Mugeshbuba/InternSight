from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.interview_session import InterviewSession

router = APIRouter(prefix="/interview-history", tags=["Interview History"])


class SessionLogRequest(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    strong_count: int = 0
    good_count: int = 0
    weak_count: int = 0
    too_short_count: int = 0
    elapsed_seconds: int = 0


@router.post("/{user_id}")
def log_session(user_id: int, body: SessionLogRequest, db: Session = Depends(get_db)):
    session = InterviewSession(user_id=user_id, **body.dict())
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "message": "Practice session saved"}


@router.get("/{user_id}")
def list_sessions(user_id: int, db: Session = Depends(get_db)):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id
    ).order_by(InterviewSession.created_at.desc()).limit(20).all()

    return [
        {
            "id": s.id,
            "company": s.company,
            "role": s.role,
            "strong_count": s.strong_count,
            "good_count": s.good_count,
            "weak_count": s.weak_count,
            "too_short_count": s.too_short_count,
            "elapsed_seconds": s.elapsed_seconds,
            "created_at": s.created_at
        }
        for s in sessions
    ]
