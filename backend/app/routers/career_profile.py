import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict

from app.database import get_db
from app.models.career_profile import CareerProfile
from app.models.user import User
from app.services.academic_records import get_academic_record_provider

router = APIRouter(prefix="/career-profile", tags=["Career Profile"])


class ApaarVerifyRequest(BaseModel):
    apaar_id: str


@router.post("/{user_id}/verify-apaar")
def verify_apaar(user_id: int, body: ApaarVerifyRequest, db: Session = Depends(get_db)):
    """
    Goes through the AcademicRecordProvider abstraction rather than hardcoding
    validation logic here — see app/services/academic_records.py.
    """
    profile = _get_or_create(user_id, db)

    provider = get_academic_record_provider()
    result = provider.verify(body.apaar_id)

    profile.apaar_id = result.apaar_id
    profile.apaar_verified = result.verified
    profile.apaar_source = result.source
    db.commit()
    db.refresh(profile)

    return {
        "apaar_id": result.apaar_id,
        "verified": result.verified,
        "source": result.source,
        "message": result.message
    }


class CareerProfileUpdate(BaseModel):
    target_role: Optional[str] = None
    dream_company: Optional[str] = None
    expected_salary: Optional[str] = None
    work_style: Optional[str] = None
    company_type: Optional[str] = None
    location_preference: Optional[str] = None
    higher_studies_plan: Optional[str] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    roadmap_progress: Optional[Dict[str, bool]] = None


def _serialize(profile: CareerProfile) -> dict:
    return {
        "user_id": profile.user_id,
        "target_role": profile.target_role,
        "dream_company": profile.dream_company,
        "expected_salary": profile.expected_salary,
        "work_style": profile.work_style,
        "company_type": profile.company_type,
        "location_preference": profile.location_preference,
        "higher_studies_plan": profile.higher_studies_plan,
        "apaar_id": profile.apaar_id,
        "apaar_verified": profile.apaar_verified,
        "apaar_source": profile.apaar_source,
        "strengths": json.loads(profile.strengths) if profile.strengths else [],
        "weaknesses": json.loads(profile.weaknesses) if profile.weaknesses else [],
        "roadmap_progress": json.loads(profile.roadmap_progress) if profile.roadmap_progress else {},
        "updated_at": profile.updated_at,
    }


def _get_or_create(user_id: int, db: Session) -> CareerProfile:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(CareerProfile).filter(CareerProfile.user_id == user_id).first()
    if not profile:
        profile = CareerProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/{user_id}")
def get_career_profile(user_id: int, db: Session = Depends(get_db)):
    profile = _get_or_create(user_id, db)
    return _serialize(profile)


@router.patch("/{user_id}")
def update_career_profile(user_id: int, update: CareerProfileUpdate, db: Session = Depends(get_db)):
    profile = _get_or_create(user_id, db)

    data = update.dict(exclude_unset=True)
    for field in ["strengths", "weaknesses", "roadmap_progress"]:
        if field in data and data[field] is not None:
            data[field] = json.dumps(data[field])

    for key, value in data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return _serialize(profile)
