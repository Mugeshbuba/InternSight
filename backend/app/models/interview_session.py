from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class InterviewSession(Base):
    """A single logged mock-interview practice session, so students can see
    their practice history over time instead of losing it on every refresh."""
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    company = Column(String, nullable=True)
    role = Column(String, nullable=True)
    strong_count = Column(Integer, default=0)
    good_count = Column(Integer, default=0)
    weak_count = Column(Integer, default=0)
    too_short_count = Column(Integer, default=0)
    elapsed_seconds = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
