from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class CareerProfile(Base):
    """
    One persistent 'AI memory' record per user.
    Holds career goal + preferences so other AI features (Career Discovery,
    Roadmap, Dashboard, Resume Builder) never have to ask the student the
    same question twice.
    """
    __tablename__ = "career_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Career goal (set by Career Discovery, editable in Settings)
    target_role = Column(String, nullable=True)
    dream_company = Column(String, nullable=True)
    expected_salary = Column(String, nullable=True)
    work_style = Column(String, nullable=True)      # remote / hybrid / office
    company_type = Column(String, nullable=True)    # startup / mnc / govt / private
    location_preference = Column(String, nullable=True)
    higher_studies_plan = Column(String, nullable=True)

    # Academic ID — see app/services/academic_records.py for why this is
    # never truly "verified" today, and how that will change later.
    apaar_id = Column(String, nullable=True)
    apaar_verified = Column(Boolean, nullable=True, default=False)
    apaar_source = Column(String, nullable=True)      # "manual_entry" until real API access exists

    # Derived "memory" fields — computed by other features, read by the Dashboard
    # Stored as JSON-encoded text (SQLite/Postgres both handle this fine without a JSON column type dependency)
    strengths = Column(Text, nullable=True)          # JSON list of strings
    weaknesses = Column(Text, nullable=True)          # JSON list of strings
    roadmap_progress = Column(Text, nullable=True)    # JSON object: {"week_1": true, ...}

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="career_profile")