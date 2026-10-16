from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import Resume
from app.services.resume_parser import parse_resume
import shutil
import os

router = APIRouter(prefix="/resume", tags=["Resume"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    parsed = parse_resume(file_path)

    resume = Resume(
        user_id=user_id,
        filename=file.filename,
        raw_text=parsed["raw_text"],
        education=parsed["education"],
        skills=parsed["skills"],
        experience=parsed["experience"],
        projects=parsed["projects"],
        certifications=parsed["certifications"]
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "message": "Resume uploaded and parsed successfully!",
        "resume_id": resume.id,
        "sections": {
            "education": parsed["education"][:200] if parsed["education"] else "Not found",
            "skills": parsed["skills"][:200] if parsed["skills"] else "Not found",
            "experience": parsed["experience"][:200] if parsed["experience"] else "Not found",
            "projects": parsed["projects"][:200] if parsed["projects"] else "Not found",
            "certifications": parsed["certifications"][:200] if parsed["certifications"] else "Not found"
        }
    }

@router.get("/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.get("/user/{user_id}/versions")
def list_resume_versions(user_id: int, db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "version_label": r.version_label,
            "created_at": r.created_at
        }
        for r in resumes
    ]

@router.patch("/{resume_id}/label")
def rename_resume_version(resume_id: int, version_label: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    resume.version_label = version_label
    db.commit()
    db.refresh(resume)
    return {"id": resume.id, "version_label": resume.version_label}

@router.delete("/{resume_id}")
def delete_resume_version(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"message": "Resume version deleted", "id": resume_id}
from app.services.resume_parser import calculate_ats_score

@router.get("/{resume_id}/score")
def get_ats_score(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    parsed = {
        "raw_text": resume.raw_text,
        "education": resume.education,
        "skills": resume.skills,
        "experience": resume.experience,
        "projects": resume.projects,
        "certifications": resume.certifications
    }

    score = calculate_ats_score(parsed)
    return score
from app.services.resume_parser import match_job_role, match_all_roles

@router.get("/{resume_id}/match-all")
def match_all_job_roles(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    results = match_all_roles(resume.raw_text)
    return {"matches": results}

@router.get("/{resume_id}/match/{role_key}")
def match_specific_role(resume_id: int, role_key: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    result = match_job_role(resume.raw_text, role_key)
    return result

from app.services.resume_parser import analyze_skill_gap

@router.get("/{resume_id}/skill-gap/{role_key}")
def skill_gap(resume_id: int, role_key: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return analyze_skill_gap(resume.raw_text or "", role_key)

from app.services.resume_parser import generate_roadmap

@router.get("/{resume_id}/roadmap/{role_key}")
def get_roadmap(resume_id: int, role_key: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    role_map = {
        "frontend_developer": "frontend_developer",
        "data_analyst": "data_analyst",
        "ml_engineer": "ml_engineer",
        "backend_developer": "backend_developer",
        "devops_engineer": "devops_engineer",
        "frontend developer": "frontend_developer",
        "data analyst": "data_analyst",
        "ml engineer": "ml_engineer",
        "backend developer": "backend_developer",
        "devops engineer": "devops_engineer",
    }

    clean_key = role_key.lower().replace(" ", "_").replace(".", "")
    mapped_key = role_map.get(clean_key, clean_key)
    result = generate_roadmap(resume.raw_text, mapped_key)
    return result


from app.services.resume_parser import detect_red_flags, improve_bullet_with_ai
from pydantic import BaseModel

class BulletRequest(BaseModel):
    bullet: str

@router.get("/{resume_id}/redflags")
def get_red_flags(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    result = detect_red_flags(resume.raw_text)
    return result

@router.post("/improve-bullet")
async def improve_bullet_point(request: BulletRequest):
    result = await improve_bullet_with_ai(request.bullet)
    return result
from app.services.resume_parser import (
    predict_score_improvements,
    calculate_salary_intelligence,
    get_peer_benchmarking,
    get_interview_questions,
    get_career_path
)

@router.get("/{resume_id}/score-predictor")
def score_predictor(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    parsed = {
        "raw_text": resume.raw_text,
        "education": resume.education,
        "skills": resume.skills,
        "experience": resume.experience,
        "projects": resume.projects,
        "certifications": resume.certifications
    }
    return {"suggestions": predict_score_improvements(parsed)}


@router.get("/{resume_id}/salary")
def salary_intelligence(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    parsed = {
        "raw_text": resume.raw_text,
        "skills": resume.skills
    }
    return calculate_salary_intelligence(parsed)


@router.get("/{resume_id}/benchmark/{role_key}")
def peer_benchmark(resume_id: int, role_key: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    from app.services.resume_parser import calculate_ats_score
    parsed = {
        "raw_text": resume.raw_text,
        "education": resume.education,
        "skills": resume.skills,
        "experience": resume.experience,
        "projects": resume.projects,
        "certifications": resume.certifications
    }
    score = calculate_ats_score(parsed)["total_score"]
    return get_peer_benchmarking(resume.raw_text, score, role_key)


@router.get("/{resume_id}/interview/{role_key}")
def interview_questions(resume_id: int, role_key: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return get_interview_questions(role_key, resume.skills or "")


@router.get("/{resume_id}/career-path")
def career_path(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return get_career_path(resume.raw_text or "")

from app.services.resume_parser import analyze_job_description, generate_self_introduction, generate_self_introduction_with_ai
from pydantic import BaseModel

class JDRequest(BaseModel):
    jd_text: str

class IntroRequest(BaseModel):
    target_role: str = ""
    duration: str = "60sec"
    experience_level: str = "fresher"

@router.post("/{resume_id}/analyze-jd")
def analyze_jd(resume_id: int, request: JDRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return analyze_job_description(resume.raw_text or "", request.jd_text)

@router.post("/{resume_id}/self-intro")
async def self_intro(resume_id: int, request: IntroRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return await generate_self_introduction_with_ai(resume.raw_text or "", request.target_role, request.duration, request.experience_level)

from fastapi.responses import FileResponse
import os

@router.get("/{resume_id}/download-original")
def download_original_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    file_path = os.path.join("uploads", resume.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        path=file_path,
        filename=resume.filename,
        media_type="application/pdf"
    )

from app.services.resume_parser import generate_cover_letter_with_ai

class CoverLetterRequest(BaseModel):
    job_title: str
    company_name: str
    tone: str = "formal"
    job_description: str = ""

@router.post("/{resume_id}/cover-letter")
async def cover_letter(resume_id: int, request: CoverLetterRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return await generate_cover_letter_with_ai(resume.raw_text or "", request.job_title, request.company_name, request.tone, request.job_description)

from app.services.resume_parser import generate_career_narrative

class CareerNarrativeRequest(BaseModel):
    quiz_scores: dict[str, int]

@router.post("/{resume_id}/career-narrative")
def career_narrative(resume_id: int, request: CareerNarrativeRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return generate_career_narrative(resume.raw_text or "", request.quiz_scores)


from app.services.resume_parser import generate_resume_summary, generate_smart_suggestion, generate_chat_response

class ResumeSummaryRequest(BaseModel):
    name: str = ""
    target_role: str = ""
    skills: str = ""
    experience_summary: str = ""
    education: str = ""

@router.post("/generate-summary")
async def generate_summary(request: ResumeSummaryRequest):
    return await generate_resume_summary(
        request.name, request.target_role, request.skills,
        request.experience_summary, request.education
    )


class SmartSuggestionRequest(BaseModel):
    field_type: str  # "experience" | "project" | "summary"
    current_text: str
    context: str = ""

@router.post("/smart-suggestion")
async def smart_suggestion(request: SmartSuggestionRequest):
    return await generate_smart_suggestion(request.field_type, request.current_text, request.context)


class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []
    ats_score: dict = {}

@router.post("/{resume_id}/chat")
async def resume_chat(resume_id: int, request: ChatRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    history = [h.dict() for h in request.conversation_history]
    return await generate_chat_response(request.message, resume.raw_text or "", request.ats_score, history)