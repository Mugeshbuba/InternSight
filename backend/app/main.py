from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import user, career_profile, interview_session
from app.routers import auth, resume, career_profile as career_profile_router, github, interview_history, portfolio, coding

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InternSight API",
    description="AI-powered Internship Readiness Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(career_profile_router.router)
app.include_router(github.router)
app.include_router(interview_history.router)
app.include_router(portfolio.router)
app.include_router(coding.router)

@app.get("/")
def home():
    return {"message": "Welcome to InternSight API 🚀"}

@app.get("/health")
def health():
    return {"status": "running"}