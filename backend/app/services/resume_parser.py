import pdfplumber
import re


def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_section(text: str, keywords: list) -> str:
    lines = text.split("\n")
    section_lines = []
    inside_section = False

    for line in lines:
        line_upper = line.upper().strip()
        if any(kw.upper() in line_upper for kw in keywords):
            inside_section = True
            continue
        if inside_section:
            if any(kw.upper() in line_upper for kw in [
                "EDUCATION", "EXPERIENCE", "SKILLS", "PROJECTS",
                "CERTIFICATIONS", "ACHIEVEMENTS", "SUMMARY", "OBJECTIVE"
            ]) and line.strip() != "":
                if not any(kw.upper() in line_upper for kw in keywords):
                    break
            section_lines.append(line)

    return "\n".join(section_lines).strip()


def parse_resume(file_path: str) -> dict:
    text = extract_text_from_pdf(file_path)
    education = extract_section(text, ["EDUCATION", "ACADEMIC"])
    skills = extract_section(text, ["SKILLS", "TECHNICAL SKILLS", "TECHNOLOGIES"])
    experience = extract_section(text, ["EXPERIENCE", "WORK EXPERIENCE", "INTERNSHIP"])
    projects = extract_section(text, ["PROJECTS", "PERSONAL PROJECTS"])
    certifications = extract_section(text, ["CERTIFICATIONS", "CERTIFICATES", "COURSES"])

    return {
        "raw_text": text,
        "education": education,
        "skills": skills,
        "experience": experience,
        "projects": projects,
        "certifications": certifications
    }


def score_skills(skills_text: str) -> dict:
    if not skills_text:
        return {"score": 0, "reason": "No skills section found in resume"}

    tech_keywords = [
        "python", "java", "javascript", "react", "node", "sql", "mongodb",
        "machine learning", "deep learning", "tensorflow", "pytorch", "docker",
        "kubernetes", "aws", "git", "html", "css", "fastapi", "flask", "django",
        "pandas", "numpy", "scikit", "excel", "power bi", "tableau", "c++", "c#"
    ]

    skills_lower = skills_text.lower()
    found = [kw for kw in tech_keywords if kw in skills_lower]
    score = min(len(found) * 8, 100)

    return {
        "score": score,
        "found_skills": found,
        "reason": f"Found {len(found)} technical skills: {', '.join(found[:5])}" if found else "No recognizable technical skills found"
    }


def score_education(education_text: str) -> dict:
    if not education_text:
        return {"score": 0, "reason": "No education section found"}

    edu_lower = education_text.lower()
    score = 0
    reasons = []

    if any(x in edu_lower for x in ["b.tech", "b.e", "bachelor", "bsc", "b.sc"]):
        score += 40
        reasons.append("Bachelor degree found")
    if any(x in edu_lower for x in ["m.tech", "master", "msc", "m.sc", "mba"]):
        score += 30
        reasons.append("Master degree found")
    if any(x in edu_lower for x in ["phd", "doctorate"]):
        score += 30
        reasons.append("PhD found")
    if any(x in edu_lower for x in ["gpa", "cgpa", "percentage", "%"]):
        score += 20
        reasons.append("GPA or percentage mentioned")
    if any(x in edu_lower for x in ["iit", "nit", "bits", "anna university", "vtu"]):
        score += 10
        reasons.append("Reputed institution found")

    score = min(score, 100)
    return {
        "score": score,
        "reason": ", ".join(reasons) if reasons else "Basic education info found"
    }


def score_experience(experience_text: str, projects_text: str) -> dict:
    if not experience_text and not projects_text:
        return {"score": 0, "reason": "No experience or projects found"}

    score = 0
    reasons = []
    combined = (experience_text or "") + " " + (projects_text or "")
    combined_lower = combined.lower()

    action_words = [
        "developed", "built", "created", "designed", "implemented",
        "optimized", "automated", "deployed", "managed", "led",
        "improved", "reduced", "increased", "achieved", "delivered"
    ]
    found_actions = [w for w in action_words if w in combined_lower]
    score += min(len(found_actions) * 10, 40)
    if found_actions:
        reasons.append(f"Strong action words: {', '.join(found_actions[:3])}")

    if any(x in combined_lower for x in ["internship", "intern", "worked at", "employed"]):
        score += 30
        reasons.append("Internship or work experience found")

    if any(x in combined_lower for x in ["%", "reduced", "increased", "improved by"]):
        score += 20
        reasons.append("Quantified achievements found")

    if projects_text and len(projects_text) > 50:
        score += 10
        reasons.append("Projects section present")

    score = min(score, 100)
    return {
        "score": score,
        "reason": ", ".join(reasons) if reasons else "Some experience content found"
    }


def score_keywords(raw_text: str) -> dict:
    if not raw_text:
        return {"score": 0, "reason": "No text found"}

    important_keywords = [
        "github", "linkedin", "portfolio", "certification", "award",
        "publication", "research", "open source", "hackathon", "volunteer",
        "leadership", "team", "communication", "problem solving"
    ]

    text_lower = raw_text.lower()
    found = [kw for kw in important_keywords if kw in text_lower]
    score = min(len(found) * 10, 100)

    return {
        "score": score,
        "found_keywords": found,
        "reason": f"Found {len(found)} important keywords" if found else "Missing important keywords like GitHub, LinkedIn, certifications"
    }


def calculate_ats_score(parsed_resume: dict) -> dict:
    skills_result = score_skills(parsed_resume.get("skills", ""))
    education_result = score_education(parsed_resume.get("education", ""))
    experience_result = score_experience(
        parsed_resume.get("experience", ""),
        parsed_resume.get("projects", "")
    )
    keywords_result = score_keywords(parsed_resume.get("raw_text", ""))

    weighted_score = (
        skills_result["score"] * 0.30 +
        education_result["score"] * 0.20 +
        experience_result["score"] * 0.35 +
        keywords_result["score"] * 0.15
    )

    final_score = round(weighted_score, 1)

    if final_score >= 80:
        grade = "Excellent"
        message = "Your resume is strong! You are likely to pass ATS filters."
    elif final_score >= 60:
        grade = "Good"
        message = "Your resume is decent but needs some improvements."
    elif final_score >= 40:
        grade = "Average"
        message = "Your resume needs significant improvements to pass ATS."
    else:
        grade = "Poor"
        message = "Your resume needs major work. Follow the recommendations below."

    return {
        "total_score": final_score,
        "grade": grade,
        "message": message,
        "breakdown": {
            "skills": skills_result,
            "education": education_result,
            "experience": experience_result,
            "keywords": keywords_result
        },
        "recommendations": generate_recommendations(
            skills_result, education_result,
            experience_result, keywords_result
        )
    }


def generate_recommendations(skills, education, experience, keywords) -> list:
    recs = []

    if skills["score"] < 50:
        recs.append("Add more technical skills like Python, SQL, React, or relevant tools to your resume")
    if education["score"] < 40:
        recs.append("Add your CGPA or percentage and institution name clearly in the education section")
    if experience["score"] < 50:
        recs.append("Use action verbs like Developed, Built, Optimized and add measurable results")
    if keywords["score"] < 40:
        recs.append("Add your GitHub profile, LinkedIn URL, and mention any certifications or hackathons")
    if experience["score"] < 30:
        recs.append("Add at least 2-3 projects with clear descriptions of what you built and technologies used")

    if not recs:
        recs.append("Great resume! Consider adding more quantified achievements like Improved performance by 30%")

    return recs


JOB_ROLES = {
    "frontend_developer": {
        "title": "Frontend Developer",
        "required_skills": ["html", "css", "javascript", "react", "typescript", "git", "responsive design", "tailwind"],
        "nice_to_have": ["nextjs", "vue", "figma", "webpack", "testing"]
    },
    "data_analyst": {
        "title": "Data Analyst",
        "required_skills": ["python", "sql", "excel", "pandas", "numpy", "power bi", "tableau", "statistics"],
        "nice_to_have": ["machine learning", "r", "matplotlib", "seaborn", "spark"]
    },
    "ml_engineer": {
        "title": "ML Engineer",
        "required_skills": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "scikit", "numpy", "pandas"],
        "nice_to_have": ["docker", "aws", "mlflow", "kafka", "spark"]
    },
    "backend_developer": {
        "title": "Backend Developer",
        "required_skills": ["python", "java", "nodejs", "sql", "rest api", "git", "docker", "postgresql"],
        "nice_to_have": ["kubernetes", "aws", "redis", "mongodb", "fastapi"]
    },
    "devops_engineer": {
        "title": "DevOps Engineer",
        "required_skills": ["docker", "kubernetes", "aws", "linux", "git", "ci/cd", "terraform", "bash"],
        "nice_to_have": ["ansible", "jenkins", "prometheus", "grafana", "azure"]
    }
}


def match_job_role(raw_text: str, role_key: str) -> dict:
    if role_key not in JOB_ROLES:
        return {"error": "Role not found"}

    role = JOB_ROLES[role_key]
    text_lower = raw_text.lower()

    matched_required = [s for s in role["required_skills"] if s in text_lower]
    missing_required = [s for s in role["required_skills"] if s not in text_lower]
    matched_nice = [s for s in role["nice_to_have"] if s in text_lower]

    match_score = round(len(matched_required) / len(role["required_skills"]) * 100, 1)

    if match_score >= 80:
        verdict = "Strong Match"
        color = "green"
    elif match_score >= 50:
        verdict = "Moderate Match"
        color = "yellow"
    else:
        verdict = "Weak Match"
        color = "red"

    return {
        "role": role["title"],
        "match_score": match_score,
        "verdict": verdict,
        "color": color,
        "matched_skills": matched_required,
        "missing_skills": missing_required,
        "bonus_skills": matched_nice,
        "recommendation": f"Add these skills to improve your match: {', '.join(missing_required[:3])}" if missing_required else "Great match! You have all required skills."
    }


SKILL_DIFFICULTY = {
    "html": "Easy", "css": "Easy", "git": "Easy", "excel": "Easy", "bash": "Easy",
    "responsive design": "Easy", "linux": "Easy", "statistics": "Medium",
    "javascript": "Medium", "sql": "Medium", "python": "Medium", "react": "Medium",
    "typescript": "Medium", "tailwind": "Medium", "rest api": "Medium", "docker": "Medium",
    "postgresql": "Medium", "nodejs": "Medium", "java": "Medium", "pandas": "Medium",
    "numpy": "Medium", "power bi": "Medium", "tableau": "Medium", "ci/cd": "Medium",
    "terraform": "Medium", "machine learning": "Hard", "deep learning": "Hard",
    "tensorflow": "Hard", "pytorch": "Hard", "scikit": "Hard", "kubernetes": "Hard"
}


def analyze_skill_gap(raw_text: str, role_key: str) -> dict:
    """Standalone Skill Gap Analysis — reuses match_job_role's core matching
    logic (no duplication) and enriches missing skills with learning time
    (from SKILL_RESOURCES, already curated/verified), a rough priority tier
    (based on position in required_skills — earlier entries tend to be more
    foundational for that role), and difficulty."""
    base = match_job_role(raw_text, role_key)
    if "error" in base:
        return base

    role = JOB_ROLES[role_key]
    missing = base["missing_skills"]
    half = max(1, len(role["required_skills"]) // 2)

    enriched_missing = []
    for skill in missing:
        position = role["required_skills"].index(skill) if skill in role["required_skills"] else 99
        resource = SKILL_RESOURCES.get(skill, {})
        enriched_missing.append({
            "skill": skill,
            "priority": "High" if position < half else "Medium",
            "difficulty": SKILL_DIFFICULTY.get(skill, "Medium"),
            "learning_time": resource.get("duration", "Varies"),
            "resource": resource.get("resource"),
            "link": resource.get("link")
        })

    enriched_missing.sort(key=lambda x: 0 if x["priority"] == "High" else 1)

    if base["match_score"] >= 80:
        advice = f"You're in strong shape for {role['title']} roles — focus on polishing what you have and start applying."
    elif base["match_score"] >= 50:
        advice = f"You have a solid foundation for {role['title']} — closing the high-priority gaps below would meaningfully strengthen your candidacy."
    else:
        advice = f"There's real work ahead for {role['title']}, but that's normal if you're early in this path — start with the High priority skills first."

    return {
        "role": base["role"],
        "match_score": base["match_score"],
        "verdict": base["verdict"],
        "color": base["color"],
        "matched_skills": base["matched_skills"],
        "bonus_skills": base["bonus_skills"],
        "missing_skills": enriched_missing,
        "career_advice": advice
    }


def match_all_roles(raw_text: str) -> list:
    results = []
    for role_key in JOB_ROLES:
        result = match_job_role(raw_text, role_key)
        results.append(result)
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


SKILL_RESOURCES = {
    "python": {"resource": "Python for Everybody - Coursera", "link": "https://www.coursera.org/specializations/python", "duration": "2 weeks",
               "book": "Automate the Boring Stuff with Python (Al Sweigart) — free at automatetheboringstuff.com", "practice": "LeetCode (Python track) — leetcode.com"},
    "sql": {"resource": "SQL Tutorial - W3Schools", "link": "https://www.w3schools.com/sql/", "duration": "1 week",
            "practice": "HackerRank SQL — hackerrank.com/domains/sql"},
    "react": {"resource": "React Official Docs", "link": "https://react.dev/learn", "duration": "3 weeks",
              "practice": "Frontend Mentor — frontendmentor.io"},
    "javascript": {"resource": "JavaScript.info", "link": "https://javascript.info", "duration": "2 weeks",
                   "book": "Eloquent JavaScript (Marijn Haverbeke) — free at eloquentjavascript.net", "practice": "Codewars — codewars.com"},
    "html": {"resource": "HTML and CSS - freeCodeCamp", "link": "https://www.freecodecamp.org", "duration": "1 week",
             "practice": "Frontend Mentor — frontendmentor.io"},
    "css": {"resource": "CSS - freeCodeCamp", "link": "https://www.freecodecamp.org", "duration": "1 week",
            "practice": "Frontend Mentor — frontendmentor.io"},
    "machine learning": {"resource": "Machine Learning Specialization - Andrew Ng, Coursera/DeepLearning.AI", "link": "https://www.coursera.org/specializations/machine-learning-introduction", "duration": "4 weeks",
                          "book": "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow (Aurélien Géron)", "practice": "Kaggle Competitions — kaggle.com/competitions"},
    "deep learning": {"resource": "Deep Learning Specialization", "link": "https://www.coursera.org/specializations/deep-learning", "duration": "4 weeks",
                       "book": "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow (Aurélien Géron)", "practice": "Kaggle Competitions — kaggle.com/competitions"},
    "docker": {"resource": "Docker Tutorial - TechWorld with Nana", "link": "https://www.youtube.com/watch?v=3c-iBn73dDE", "duration": "1 week"},
    "git": {"resource": "Git and GitHub - freeCodeCamp", "link": "https://www.youtube.com/watch?v=RGOj5yH7evk", "duration": "3 days",
            "practice": "Learn Git Branching (interactive) — learngitbranching.js.org"},
    "pandas": {"resource": "Pandas Tutorial - Kaggle", "link": "https://www.kaggle.com/learn/pandas", "duration": "1 week",
               "practice": "Kaggle Datasets — kaggle.com/datasets"},
    "numpy": {"resource": "NumPy Tutorial - freeCodeCamp", "link": "https://www.youtube.com/watch?v=QUT1VHiLmmI", "duration": "3 days"},
    "tensorflow": {"resource": "TensorFlow Tutorial - Official", "link": "https://www.tensorflow.org/tutorials", "duration": "3 weeks",
                   "practice": "Kaggle Competitions — kaggle.com/competitions"},
    "pytorch": {"resource": "PyTorch Tutorial - Official", "link": "https://pytorch.org/tutorials/", "duration": "3 weeks",
                "practice": "Kaggle Competitions — kaggle.com/competitions"},
    "aws": {"resource": "AWS Skill Builder", "link": "https://skillbuilder.aws", "duration": "2 weeks",
            "practice": "AWS Skill Builder hands-on labs — skillbuilder.aws"},
    "power bi": {"resource": "Power BI - Microsoft Learn", "link": "https://learn.microsoft.com/en-us/power-bi/", "duration": "1 week",
                 "practice": "Practice with real datasets on Kaggle — kaggle.com/datasets"},
    "tableau": {"resource": "Tableau Public Free Training", "link": "https://www.tableau.com/learn/training", "duration": "1 week",
                "practice": "Tableau Public gallery — public.tableau.com"},
    "nodejs": {"resource": "Node.js - The Odin Project", "link": "https://www.theodinproject.com", "duration": "2 weeks",
               "practice": "Codewars — codewars.com"},
    "mongodb": {"resource": "MongoDB University", "link": "https://university.mongodb.com", "duration": "1 week",
                "practice": "MongoDB University hands-on labs — university.mongodb.com"},
    "kubernetes": {"resource": "Kubernetes Tutorial - TechWorld", "link": "https://www.youtube.com/watch?v=X48VuDVv0do", "duration": "2 weeks",
                   "practice": "Official interactive tutorial — kubernetes.io/docs/tutorials/kubernetes-basics"}
}


def generate_roadmap(raw_text: str, role_key: str) -> dict:
    if role_key not in JOB_ROLES:
        return {"error": "Role not found"}

    role = JOB_ROLES[role_key]
    text_lower = raw_text.lower()

    missing_skills = [s for s in role["required_skills"] if s not in text_lower]
    matched_skills = [s for s in role["required_skills"] if s in text_lower]

    weeks = []
    week_number = 1

    for skill in missing_skills:
        resource_info = SKILL_RESOURCES.get(skill, {
            "resource": f"Search {skill} tutorial on YouTube",
            "link": "https://www.youtube.com/results?search_query=" + skill.replace(" ", "+") + "+tutorial",
            "duration": "1 week"
        })

        weeks.append({
            "week": week_number,
            "skill": skill,
            "resource": resource_info["resource"],
            "link": resource_info["link"],
            "duration": resource_info["duration"],
            "book": resource_info.get("book"),
            "practice": resource_info.get("practice"),
            "task": f"Learn {skill} and build a small project using it",
            "daily_plan": [
                {"day": "Day 1-2", "focus": f"Learn the fundamentals of {skill} through documentation and beginner tutorials."},
                {"day": "Day 3-4", "focus": f"Practice with small coding exercises focused specifically on {skill}."},
                {"day": "Day 5-6", "focus": f"Apply {skill} in a small hands-on project — build something real, not just tutorials."},
                {"day": "Day 7", "focus": f"Review what you learned, note it on your resume, and identify what still feels unclear."}
            ]
        })
        week_number += 1

    if not missing_skills:
        summary = f"You already have all required skills for {role['title']}! Focus on building projects and applying."
    else:
        summary = f"Follow this {len(weeks)}-week plan to become {role['title']} ready!"

    return {
        "role": role["title"],
        "total_weeks": len(weeks),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "summary": summary,
        "roadmap": weeks
    }


def detect_red_flags(raw_text: str) -> dict:
    if not raw_text:
        return {"flags": [], "score": 100}

    flags = []
    text_lower = raw_text.lower()

    vague_words = [
        "responsible for", "worked on", "helped with", "assisted in",
        "involved in", "participated in", "familiar with", "exposure to", "knowledge of"
    ]
    found_vague = [w for w in vague_words if w in text_lower]
    if found_vague:
        flags.append({
            "type": "Vague Language",
            "severity": "High",
            "detail": "Found weak phrases: " + ", ".join(found_vague),
            "fix": "Replace with strong action verbs like Developed, Built, Led, Optimized"
        })

    if not any(x in text_lower for x in ["%", "increased", "decreased", "reduced", "improved by", "achieved", "delivered"]):
        flags.append({
            "type": "Missing Metrics",
            "severity": "High",
            "detail": "No quantified achievements found in resume",
            "fix": "Add numbers like Improved performance by 30% or Built app used by 500+ users"
        })

    if not any(x in text_lower for x in ["github", "linkedin", "portfolio", "behance"]):
        flags.append({
            "type": "Missing Online Presence",
            "severity": "Medium",
            "detail": "No GitHub, LinkedIn or portfolio link found",
            "fix": "Add your GitHub and LinkedIn profile URLs to the resume header"
        })

    if len(raw_text) < 300:
        flags.append({
            "type": "Resume Too Short",
            "severity": "High",
            "detail": "Resume content seems too short or sparse",
            "fix": "Add more details about your projects, skills and experience"
        })

    if len(raw_text) > 5000:
        flags.append({
            "type": "Resume Too Long",
            "severity": "Medium",
            "detail": "Resume content is very long, keep it to 1-2 pages",
            "fix": "Trim unnecessary details and keep only the most relevant information"
        })

    if not any(x in text_lower for x in ["project", "built", "developed", "created", "designed"]):
        flags.append({
            "type": "No Projects Found",
            "severity": "High",
            "detail": "No projects section detected in resume",
            "fix": "Add at least 2-3 projects with tech stack and what you built"
        })

    if not any(x in text_lower for x in ["certification", "certified", "course", "training"]):
        flags.append({
            "type": "No Certifications",
            "severity": "Low",
            "detail": "No certifications or courses mentioned",
            "fix": "Add relevant certifications from Coursera, Udemy, or Google"
        })

    score = max(0, 100 - len(flags) * 15)

    return {
        "total_flags": len(flags),
        "resume_health_score": score,
        "flags": flags,
        "summary": "Great resume! No major issues found." if len(flags) == 0 else f"Found {len(flags)} issues that could be hurting your resume."
    }


async def generate_resume_summary(name: str, target_role: str, skills: str, experience_summary: str, education: str) -> dict:
    """Generates a 2-3 sentence professional summary/objective for the top
    of a resume. AI-only feature — no meaningful rule-based fallback exists
    for genuinely personalized summary writing, so this returns a clear
    'unavailable' message rather than a generic templated paragraph that
    would read as obviously fake."""
    from app.services.ai_service import call_ai

    prompt = (
        f"Name: {name}\nTarget role: {target_role}\nSkills: {skills}\n"
        f"Experience: {experience_summary}\nEducation: {education}"
    )

    ai_result = await call_ai(
        system_prompt=(
            "Write a 2-3 sentence professional resume summary/objective based ONLY on the information given. "
            "Do not invent years of experience, companies, or achievements not mentioned. "
            "If experience is thin (student/fresher), write an objective-style summary emphasizing skills and "
            "eagerness to contribute rather than fabricating a work history. Return ONLY the summary text."
        ),
        user_prompt=prompt,
        max_tokens=150,
        temperature=0.7
    )

    if ai_result:
        return {"summary": ai_result, "ai_generated": True}

    return {
        "summary": None,
        "ai_generated": False,
        "message": "AI summary generation is temporarily unavailable — please write your own summary for now."
    }


async def generate_smart_suggestion(field_type: str, current_text: str, context: str = "") -> dict:
    """Powers live 'while you type' suggestions in Resume Builder. Deliberately
    lightweight (short max_tokens) since this can be called frequently —
    cost control matters more here than for one-shot generations."""
    from app.services.ai_service import call_ai

    if len(current_text.strip()) < 10:
        return {"suggestion": None, "ai_generated": False}

    field_prompts = {
        "experience": "Suggest a stronger, more specific rewrite of this resume experience bullet. Keep the same facts, don't invent metrics.",
        "project": "Suggest a stronger, more specific rewrite of this project description. Keep the same facts, don't invent metrics.",
        "summary": "Suggest a tightened, more impactful rewrite of this resume summary. Keep the same facts."
    }
    system_prompt = field_prompts.get(field_type, field_prompts["experience"])
    if context:
        system_prompt += f" Context: {context}"
    system_prompt += " Return ONLY the suggested rewrite, one sentence, nothing else."

    ai_result = await call_ai(system_prompt=system_prompt, user_prompt=current_text, max_tokens=80, temperature=0.6)

    if ai_result:
        return {"suggestion": ai_result, "ai_generated": True}
    return {"suggestion": None, "ai_generated": False}


async def generate_chat_response(user_message: str, resume_text: str, ats_score: dict, conversation_history: list) -> dict:
    """Real AI-backed resume coaching chat. Falls back to None (frontend
    uses its local rule-based responses) on any AI failure — the chat
    should never just stop working because OpenAI had a bad moment."""
    from app.services.ai_service import call_ai

    score_context = ""
    if ats_score:
        score_context = f"Student's current ATS score: {ats_score.get('total_score', 'N/A')}/100. "

    history_text = ""
    for turn in conversation_history[-6:]:  # last 6 turns for context, keep prompt size sane
        role = "Student" if turn.get("role") == "user" else "Coach"
        history_text += f"{role}: {turn.get('text','')}\n"

    prompt = (
        f"{score_context}Resume excerpt: {resume_text[:1000]}\n\n"
        f"Conversation so far:\n{history_text}\n"
        f"Student's new message: {user_message}"
    )

    ai_result = await call_ai(
        system_prompt=(
            "You are a friendly, encouraging resume coach helping a student improve their resume "
            "and prepare for job applications. Give specific, actionable advice based on their actual "
            "resume content and ATS score when relevant. Keep responses concise — 3-5 sentences unless "
            "they ask for something detailed like a rewritten bullet point. Never fabricate resume "
            "content or achievements the student hasn't mentioned."
        ),
        user_prompt=prompt,
        max_tokens=300,
        temperature=0.7
    )

    if ai_result:
        return {"response": ai_result, "ai_generated": True}
    return {"response": None, "ai_generated": False}


def generate_career_narrative(resume_text: str, quiz_scores: dict) -> dict:
    """Blends Career Discovery quiz answers (60%) with real resume skill
    matching (40%) into a per-role narrative. Returns top 3 roles ranked
    by combined_score. Contract is load-bearing — CareerDiscovery.jsx
    reads role_key/title/combined_score/quiz_pct/resume_pct/matched_skills/
    missing_skills/narrative directly, so don't rename fields casually."""
    text_lower = (resume_text or "").lower()
    max_quiz = max(quiz_scores.values()) if quiz_scores else 0

    narratives = []
    for role_key, role in JOB_ROLES.items():
        quiz_score = quiz_scores.get(role_key, 0)
        quiz_pct = round((quiz_score / max_quiz) * 100) if max_quiz > 0 else 0

        matched_skills = [s for s in role["required_skills"] if s in text_lower]
        missing_skills = [s for s in role["required_skills"] if s not in text_lower]
        resume_pct = round((len(matched_skills) / len(role["required_skills"])) * 100) if role["required_skills"] else 0

        combined_score = round(quiz_pct * 0.6 + resume_pct * 0.4)

        if matched_skills:
            narrative = (
                f"Your quiz answers point toward {role['title']}, and your resume backs that up — "
                f"you already show {', '.join(matched_skills[:3])}"
                f"{' and more' if len(matched_skills) > 3 else ''}. "
                f"{'A strong overall fit.' if combined_score >= 70 else 'A reasonable starting point with room to grow.'}"
            )
        else:
            narrative = (
                f"Your quiz answers point toward {role['title']}, though your resume doesn't yet show "
                f"the core skills for this path — that's normal if you're just starting out."
            )

        narratives.append({
            "role_key": role_key,
            "title": role["title"],
            "combined_score": combined_score,
            "quiz_pct": quiz_pct,
            "resume_pct": resume_pct,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "narrative": narrative
        })

    narratives.sort(key=lambda x: x["combined_score"], reverse=True)
    return {"narratives": narratives[:3]}


def _generate_improvement_tips(bullet_lower: str) -> list:
    """Shared between the AI path and the rule-based fallback — these are
    honest observations about the ORIGINAL bullet, not claims about what
    the rewrite fixed, since we don't want to overstate either path."""
    tips = []
    has_metric = any(x in bullet_lower for x in [
        "%", "users", "seconds", "hours", "days", "months", "weeks",
        "k ", "thousand", "million", "x faster", "x improvement"
    ])
    if not has_metric:
        tips.append("Add a specific metric like 30% faster or 500+ users for more impact")

    has_tech = any(x in bullet_lower for x in [
        "python", "java", "react", "sql", "node", "docker", "aws",
        "tensorflow", "api", "html", "css", "javascript", "mongodb",
        "git", "flask", "django", "mysql", "postgresql"
    ])
    if not has_tech:
        tips.append("Mention specific technologies or tools you used for stronger impact")

    return tips


async def improve_bullet_with_ai(bullet_text: str) -> dict:
    """Tries a real AI rewrite first; falls back to the rule-based version
    on any failure (no API key, network issue, rate limit) so this feature
    never just breaks because OpenAI had a bad moment."""
    from app.services.ai_service import call_ai

    bullet = bullet_text.strip()
    ai_result = await call_ai(
        system_prompt=(
            "You rewrite a single resume bullet point to be more professional and impactful. "
            "Start with a strong action verb. Keep it to one sentence. Do not invent metrics "
            "or achievements that weren't implied by the original — only rephrase what's there. "
            "Return ONLY the rewritten bullet point, nothing else — no quotes, no explanation."
        ),
        user_prompt=bullet,
        max_tokens=100,
        temperature=0.6
    )

    if ai_result:
        tips = _generate_improvement_tips(bullet.lower())
        return {
            "original": bullet_text,
            "improved": ai_result,
            "improvements_made": tips if tips else ["Rewritten for stronger, more professional phrasing"],
            "tip": "Best format: Action Verb + What you did + Result or Impact + Technology used",
            "example": "Developed a REST API using FastAPI that reduced data processing time by 40%, serving 500+ daily users",
            "ai_generated": True
        }

    # AI unavailable — fall back to the rule-based rewrite, unchanged behavior
    fallback = improve_bullet_rule_based(bullet_text)
    fallback["ai_generated"] = False
    return fallback


def improve_bullet_rule_based(bullet_text: str) -> dict:
    bullet = bullet_text.strip()
    bullet_lower = bullet.lower()
    improvements = []

    weak_starters = {
        "responsible for": "Led",
        "worked on": "Built",
        "helped with": "Contributed to",
        "assisted in": "Supported",
        "involved in": "Participated in developing",
        "participated in": "Actively developed",
        "familiar with": "Proficient in",
        "exposure to": "Experienced with",
        "knowledge of": "Skilled in",
        "tasked with": "Delivered",
        "in charge of": "Managed",
        "part of team": "Collaborated to build",
    }

    improved = bullet
    replaced = False

    for weak, strong in weak_starters.items():
        if bullet_lower.startswith(weak):
            rest = bullet[len(weak):].strip()
            rest = rest[0].upper() + rest[1:] if rest else rest
            improved = strong + " " + rest
            improvements.append("Replaced weak phrase with strong verb " + strong)
            replaced = True
            break

    if not replaced:
        first_word = bullet.split()[0].lower() if bullet.split() else ""
        action_verbs = [
            "developed", "built", "created", "designed", "implemented",
            "optimized", "automated", "deployed", "managed", "led",
            "improved", "reduced", "increased", "delivered", "architected",
            "engineered", "launched", "established", "coordinated"
        ]
        if first_word not in action_verbs:
            improved = "Developed " + improved[0].lower() + improved[1:]
            improvements.append("Added strong action verb at the beginning")

    has_metric = any(x in bullet_lower for x in [
        "%", "users", "seconds", "hours", "days", "months", "weeks",
        "k ", "thousand", "million", "x faster", "x improvement"
    ])
    if not has_metric:
        improved = improved.rstrip(".").rstrip(",") + ", resulting in measurable improvement."
        improvements.append("Add a specific metric like 30% faster or 500+ users for more impact")

    has_tech = any(x in bullet_lower for x in [
        "python", "java", "react", "sql", "node", "docker", "aws",
        "tensorflow", "api", "html", "css", "javascript", "mongodb",
        "git", "flask", "django", "mysql", "postgresql"
    ])
    if not has_tech:
        improvements.append("Mention specific technologies or tools you used for stronger impact")

    if not improvements:
        improvements.append("Your bullet looks good! Consider adding more specific metrics for even better impact")

    return {
        "original": bullet_text,
        "improved": improved,
        "improvements_made": improvements,
        "tip": "Best format: Action Verb + What you did + Result or Impact + Technology used",
        "example": "Developed a REST API using FastAPI that reduced data processing time by 40%, serving 500+ daily users"
    }


def predict_score_improvements(parsed_resume: dict) -> list:
    current = calculate_ats_score(parsed_resume)
    current_score = current["total_score"]
    suggestions = []

    test_additions = [
        {"skill": "github", "label": "Add GitHub profile link", "section": "keywords"},
        {"skill": "linkedin", "label": "Add LinkedIn profile URL", "section": "keywords"},
        {"skill": "docker", "label": "Add Docker to your skills", "section": "skills"},
        {"skill": "python", "label": "Add Python to your skills", "section": "skills"},
        {"skill": "sql", "label": "Add SQL to your skills", "section": "skills"},
        {"skill": "react", "label": "Add React to your skills", "section": "skills"},
        {"skill": "aws", "label": "Add AWS to your skills", "section": "skills"},
        {"skill": "cgpa", "label": "Add your CGPA to education section", "section": "education"},
        {"skill": "internship", "label": "Add internship experience", "section": "experience"},
        {"skill": "reduced", "label": "Add metrics like reduced by 30%", "section": "experience"},
        {"skill": "certification", "label": "Add a certification", "section": "keywords"},
        {"skill": "hackathon", "label": "Add hackathon participation", "section": "keywords"},
    ]

    for addition in test_additions:
        raw = parsed_resume.get("raw_text", "")
        if addition["skill"] in raw.lower():
            continue

        test_resume = parsed_resume.copy()
        section = addition["section"]
        current_section = test_resume.get(section, "") or ""
        test_resume[section] = current_section + " " + addition["skill"]
        test_resume["raw_text"] = raw + " " + addition["skill"]

        new_score = calculate_ats_score(test_resume)["total_score"]
        improvement = round(new_score - current_score, 1)

        if improvement > 0:
            suggestions.append({
                "action": addition["label"],
                "current_score": current_score,
                "new_score": new_score,
                "improvement": improvement,
                "impact": "High" if improvement >= 5 else "Medium" if improvement >= 3 else "Low"
            })

    suggestions.sort(key=lambda x: x["improvement"], reverse=True)
    return suggestions[:6]


def calculate_salary_intelligence(parsed_resume: dict) -> dict:
    skills_text = (parsed_resume.get("skills", "") or "").lower()
    raw_text = (parsed_resume.get("raw_text", "") or "").lower()
    combined = skills_text + " " + raw_text

    high_paying = [
        "machine learning", "deep learning", "aws", "kubernetes", "docker",
        "tensorflow", "pytorch", "react", "nodejs", "golang", "scala", "spark"
    ]
    mid_paying = [
        "python", "sql", "java", "javascript", "mongodb", "postgresql",
        "git", "linux", "fastapi", "django", "flask"
    ]

    high_count = sum(1 for s in high_paying if s in combined)
    mid_count = sum(1 for s in mid_paying if s in combined)

    if high_count >= 3:
        min_salary, max_salary = 8, 15
        level = "Senior"
        percentile = 85
    elif high_count >= 1 or mid_count >= 4:
        min_salary, max_salary = 5, 10
        level = "Mid"
        percentile = 60
    elif mid_count >= 2:
        min_salary, max_salary = 3, 6
        level = "Junior"
        percentile = 40
    else:
        min_salary, max_salary = 2, 4
        level = "Entry"
        percentile = 20

    top_skill_for_salary = None
    max_boost = 0
    boost_skills = {
        "machine learning": 3, "aws": 2.5, "kubernetes": 2,
        "react": 1.5, "docker": 1.5, "python": 1,
        "sql": 0.8, "tensorflow": 2.5
    }

    for skill, boost in boost_skills.items():
        if skill not in combined and boost > max_boost:
            max_boost = boost
            top_skill_for_salary = skill

    return {
        "min_salary": min_salary,
        "max_salary": max_salary,
        "currency": "LPA",
        "level": level,
        "market_percentile": percentile,
        "message": f"Based on your skills you qualify for {level} level roles paying Rs.{min_salary}-{max_salary} LPA",
        "top_skill_to_learn": top_skill_for_salary,
        "salary_boost_if_learned": f"+Rs.{max_boost} LPA" if top_skill_for_salary else None,
        "high_value_skills_found": [s for s in high_paying if s in combined],
        "skills_to_add_for_higher_pay": [s for s in high_paying if s not in combined][:4]
    }


PEER_DATA = {
    "data_analyst": {
        "avg_score": 58,
        "top_skills": ["python", "sql", "tableau", "pandas"],
        "hired_keywords": ["dashboard", "visualization", "insights", "kpi"]
    },
    "frontend_developer": {
        "avg_score": 62,
        "top_skills": ["react", "javascript", "css", "git"],
        "hired_keywords": ["responsive", "ui", "component", "api"]
    },
    "ml_engineer": {
        "avg_score": 65,
        "top_skills": ["python", "tensorflow", "pytorch", "numpy"],
        "hired_keywords": ["model", "training", "accuracy", "deployment"]
    },
    "backend_developer": {
        "avg_score": 60,
        "top_skills": ["python", "nodejs", "sql", "docker"],
        "hired_keywords": ["api", "database", "scalable", "microservices"]
    },
    "devops_engineer": {
        "avg_score": 63,
        "top_skills": ["docker", "kubernetes", "aws", "linux"],
        "hired_keywords": ["pipeline", "deployment", "infrastructure", "monitoring"]
    }
}


def get_peer_benchmarking(raw_text: str, ats_score: float, role_key: str = "data_analyst") -> dict:
    peer = PEER_DATA.get(role_key, PEER_DATA["data_analyst"])
    avg = peer["avg_score"]
    text_lower = raw_text.lower()

    percentile = min(99, max(1, int(50 + (ats_score - avg) * 1.5)))

    missing_top = [s for s in peer["top_skills"] if s not in text_lower]
    has_hired = [k for k in peer["hired_keywords"] if k in text_lower]
    missing_hired = [k for k in peer["hired_keywords"] if k not in text_lower]

    if percentile >= 75:
        standing = "Top Candidate"
        message = f"Your resume scores better than {percentile}% of {role_key.replace('_', ' ')} applicants!"
    elif percentile >= 50:
        standing = "Above Average"
        message = f"Your resume is above average! Better than {percentile}% of applicants."
    elif percentile >= 25:
        standing = "Below Average"
        message = f"Your resume needs improvement. Only better than {percentile}% of applicants."
    else:
        standing = "Needs Work"
        message = f"Your resume needs significant work. Better than only {percentile}% of applicants."

    return {
        "percentile": percentile,
        "standing": standing,
        "message": message,
        "your_score": ats_score,
        "average_score": avg,
        "missing_top_skills": missing_top,
        "hired_keywords_found": has_hired,
        "hired_keywords_missing": missing_hired,
        "tip": f"Add these keywords that hired candidates use: {', '.join(missing_hired[:3])}" if missing_hired else "Great! You have all the key hired candidate keywords!"
    }


INTERVIEW_QUESTIONS = {
    "frontend_developer": [
        {"q": "What is the difference between let, const and var in JavaScript?", "category": "Technical", "hint": "Talk about scope, hoisting and mutability"},
        {"q": "Explain the React component lifecycle.", "category": "Technical", "hint": "Mention mounting, updating and unmounting phases"},
        {"q": "What is CSS Box Model?", "category": "Technical", "hint": "Content, padding, border, margin"},
        {"q": "How does virtual DOM work in React?", "category": "Technical", "hint": "Compare with real DOM, reconciliation process"},
        {"q": "Tell me about a frontend project you built.", "category": "Behavioral", "hint": "Use STAR method: Situation, Task, Action, Result"},
        {"q": "How do you handle API calls in React?", "category": "Technical", "hint": "Mention useEffect, axios or fetch, loading states"},
        {"q": "What is responsive design and how do you implement it?", "category": "Technical", "hint": "Media queries, flexbox, grid, mobile first"},
        {"q": "Why do you want to work as a Frontend Developer?", "category": "HR", "hint": "Be genuine, mention specific interests"}
    ],
    "data_analyst": [
        {"q": "What is the difference between supervised and unsupervised learning?", "category": "Technical", "hint": "Labeled vs unlabeled data, examples of each"},
        {"q": "How do you handle missing data in a dataset?", "category": "Technical", "hint": "Imputation, dropping, filling with mean or median"},
        {"q": "Explain the difference between SQL JOIN types.", "category": "Technical", "hint": "INNER, LEFT, RIGHT, FULL OUTER JOIN"},
        {"q": "What is a pivot table and when do you use it?", "category": "Technical", "hint": "Summarizing data, Excel or Pandas pivot_table"},
        {"q": "Describe a data analysis project you worked on.", "category": "Behavioral", "hint": "What problem, what data, what insights, what impact"},
        {"q": "How do you ensure data quality in your analysis?", "category": "Technical", "hint": "Validation, cleaning, consistency checks"},
        {"q": "What visualization tools have you used?", "category": "Technical", "hint": "Tableau, Power BI, matplotlib, seaborn"},
        {"q": "Where do you see yourself in 5 years?", "category": "HR", "hint": "Show ambition but be realistic"}
    ],
    "ml_engineer": [
        {"q": "Explain overfitting and how to prevent it.", "category": "Technical", "hint": "Regularization, dropout, cross validation, more data"},
        {"q": "What is the difference between precision and recall?", "category": "Technical", "hint": "TP, FP, FN formulas and when each matters"},
        {"q": "How does gradient descent work?", "category": "Technical", "hint": "Loss function, learning rate, weight updates"},
        {"q": "What is cross validation and why is it important?", "category": "Technical", "hint": "K-fold, train test split, preventing data leakage"},
        {"q": "Describe an ML model you built from scratch.", "category": "Behavioral", "hint": "Problem, data, model choice, evaluation, deployment"},
        {"q": "What is the bias-variance tradeoff?", "category": "Technical", "hint": "Underfitting vs overfitting, model complexity"},
        {"q": "How do you choose between different ML algorithms?", "category": "Technical", "hint": "Data size, features, interpretability, accuracy needs"},
        {"q": "What motivates you about machine learning?", "category": "HR", "hint": "Real world impact, problem solving, innovation"}
    ],
    "backend_developer": [
        {"q": "What is REST API and what are its principles?", "category": "Technical", "hint": "Stateless, uniform interface, HTTP methods"},
        {"q": "Explain database indexing and when to use it.", "category": "Technical", "hint": "Speed up reads, slow down writes, when queries are slow"},
        {"q": "What is the difference between SQL and NoSQL?", "category": "Technical", "hint": "Structured vs flexible, ACID vs BASE, use cases"},
        {"q": "How do you handle authentication in a web application?", "category": "Technical", "hint": "JWT, sessions, OAuth, bcrypt for passwords"},
        {"q": "Describe a backend system you built.", "category": "Behavioral", "hint": "Architecture, challenges, how you solved them"},
        {"q": "What is caching and how does it improve performance?", "category": "Technical", "hint": "Redis, in-memory, cache invalidation strategies"},
        {"q": "How do you ensure your API is secure?", "category": "Technical", "hint": "Auth, rate limiting, input validation, HTTPS"},
        {"q": "Tell me about a technical challenge you overcame.", "category": "HR", "hint": "Show problem solving and persistence"}
    ],
    "devops_engineer": [
        {"q": "What is Docker and how does containerization work?", "category": "Technical", "hint": "Images, containers, isolation, portability"},
        {"q": "Explain CI/CD pipeline and its benefits.", "category": "Technical", "hint": "Automated testing, deployment, faster releases"},
        {"q": "What is Kubernetes and why is it used?", "category": "Technical", "hint": "Container orchestration, scaling, self-healing"},
        {"q": "How do you monitor a production system?", "category": "Technical", "hint": "Prometheus, Grafana, logs, alerts, uptime"},
        {"q": "Describe a deployment you managed.", "category": "Behavioral", "hint": "What system, what challenges, zero downtime strategies"},
        {"q": "What is Infrastructure as Code?", "category": "Technical", "hint": "Terraform, Ansible, reproducible environments"},
        {"q": "How do you handle a production outage?", "category": "Technical", "hint": "Incident response, rollback, root cause analysis"},
        {"q": "Why do you want to work in DevOps?", "category": "HR", "hint": "Automation passion, bridging dev and ops"}
    ]
}


def get_interview_questions(role_key: str, skills_text: str = "") -> dict:
    questions = INTERVIEW_QUESTIONS.get(role_key, INTERVIEW_QUESTIONS["backend_developer"])

    categorized = {"Technical": [], "Behavioral": [], "HR": []}
    for q in questions:
        categorized[q["category"]].append(q)

    return {
        "role": role_key.replace("_", " ").title(),
        "total_questions": len(questions),
        "questions": questions,
        "categorized": categorized,
        "tip": "Prepare 2-3 questions to ask the interviewer at the end. It shows genuine interest!"
    }


CAREER_PATHS = {
    "data_analyst": {
        "current": "Data Analyst",
        "next": "Senior Data Analyst",
        "advanced": "Data Science Manager",
        "switch_options": ["ml_engineer", "backend_developer"],
        "skills_for_next": ["machine learning", "python", "statistics", "spark"],
        "timeline": "6-12 months"
    },
    "frontend_developer": {
        "current": "Frontend Developer",
        "next": "Senior Frontend or Full Stack",
        "advanced": "Frontend Architect",
        "switch_options": ["backend_developer", "devops_engineer"],
        "skills_for_next": ["nodejs", "typescript", "testing", "system design"],
        "timeline": "8-12 months"
    },
    "ml_engineer": {
        "current": "ML Engineer",
        "next": "Senior ML Engineer",
        "advanced": "ML Research Scientist",
        "switch_options": ["data_analyst", "backend_developer"],
        "skills_for_next": ["mlops", "spark", "kubernetes", "research papers"],
        "timeline": "12-18 months"
    },
    "backend_developer": {
        "current": "Backend Developer",
        "next": "Senior Backend or Architect",
        "advanced": "Principal Engineer",
        "switch_options": ["devops_engineer", "frontend_developer"],
        "skills_for_next": ["system design", "kubernetes", "microservices", "leadership"],
        "timeline": "8-14 months"
    },
    "devops_engineer": {
        "current": "DevOps Engineer",
        "next": "Senior DevOps or SRE",
        "advanced": "Platform Engineering Lead",
        "switch_options": ["backend_developer", "ml_engineer"],
        "skills_for_next": ["kubernetes", "terraform", "security", "cost optimization"],
        "timeline": "10-14 months"
    }
}


def get_career_path(raw_text: str) -> dict:
    text_lower = raw_text.lower()
    best_role = "backend_developer"
    best_score = 0

    for role_key in JOB_ROLES:
        role = JOB_ROLES[role_key]
        matched = sum(1 for s in role["required_skills"] if s in text_lower)
        if matched > best_score:
            best_score = matched
            best_role = role_key

    path = CAREER_PATHS.get(best_role, CAREER_PATHS["backend_developer"])
    current_skills = [s for s in JOB_ROLES[best_role]["required_skills"] if s in text_lower]
    missing_skills = [s for s in CAREER_PATHS[best_role]["skills_for_next"] if s not in text_lower]

    return {
        "detected_role": best_role.replace("_", " ").title(),
        "current_level": path["current"],
        "next_level": path["next"],
        "advanced_level": path["advanced"],
        "switch_options": [r.replace("_", " ").title() for r in path["switch_options"]],
        "skills_you_have": current_skills,
        "skills_for_next_level": missing_skills,
        "estimated_timeline": path["timeline"],
        "message": f"You are on track to become a {path['next']} in {path['timeline']}!"
    }


def analyze_job_description(resume_text: str, jd_text: str) -> dict:
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()

    tech_skills = [
        "python", "java", "javascript", "react", "nodejs", "sql", "mongodb",
        "docker", "kubernetes", "aws", "git", "html", "css", "typescript",
        "machine learning", "deep learning", "tensorflow", "pytorch", "pandas",
        "numpy", "flask", "django", "fastapi", "postgresql", "redis", "linux",
        "tableau", "power bi", "excel", "spark", "scala", "golang", "kotlin"
    ]

    soft_skills = [
        "communication", "teamwork", "leadership", "problem solving",
        "analytical", "creative", "detail oriented", "self motivated",
        "time management", "collaboration", "adaptable", "critical thinking"
    ]

    jd_tech = [s for s in tech_skills if s in jd_lower]
    jd_soft = [s for s in soft_skills if s in jd_lower]
    all_jd_skills = jd_tech + jd_soft

    matched = [s for s in all_jd_skills if s in resume_lower]
    missing = [s for s in all_jd_skills if s not in resume_lower]

    match_score = round(len(matched) / len(all_jd_skills) * 100, 1) if all_jd_skills else 0

    if match_score >= 70:
        verdict = "Strong Match - Apply Now!"
        verdict_color = "green"
        advice = "Your resume is a strong match for this job! Apply confidently."
    elif match_score >= 45:
        verdict = "Moderate Match - Improve First"
        verdict_color = "yellow"
        advice = "You match some requirements. Add the missing skills to increase your chances."
    else:
        verdict = "Weak Match - Not Ready Yet"
        verdict_color = "red"
        advice = "Your resume needs significant work before applying for this role."

    keywords_in_jd = []
    action_words = [
        "develop", "build", "design", "implement", "manage", "lead",
        "analyze", "optimize", "deploy", "maintain", "create", "test"
    ]
    for word in action_words:
        if word in jd_lower:
            keywords_in_jd.append(word)

    missing_keywords = [w for w in keywords_in_jd if w not in resume_lower]

    strengths = []
    weaknesses = []

    if len(matched) >= len(all_jd_skills) * 0.7:
        strengths.append("Strong technical skill match with job requirements")
    if "python" in resume_lower and "python" in jd_lower:
        strengths.append("Python proficiency matches job requirement")
    if "git" in resume_lower:
        strengths.append("Version control experience is a plus")
    if len(missing) > len(matched):
        weaknesses.append("Missing more than half of required technical skills")
    if not any(x in resume_lower for x in ["%", "improved", "reduced", "increased"]):
        weaknesses.append("Resume lacks quantified achievements")
    if not any(x in resume_lower for x in ["github", "linkedin", "portfolio"]):
        weaknesses.append("No online presence links found")

    return {
        "match_score": match_score,
        "verdict": verdict,
        "verdict_color": verdict_color,
        "advice": advice,
        "matched_skills": matched,
        "missing_skills": missing,
        "missing_keywords": missing_keywords,
        "strengths": strengths if strengths else ["Some relevant experience found"],
        "weaknesses": weaknesses if weaknesses else ["Keep improving your profile"],
        "total_jd_skills": len(all_jd_skills),
        "ats_risk": "High" if match_score < 40 else "Medium" if match_score < 70 else "Low",
        "recruiter_note": f"Candidate matches {match_score}% of job requirements. Recommend for interview." if match_score >= 70 else f"Candidate matches {match_score}% of job requirements. Needs skill development." if match_score >= 45 else f"Candidate matches {match_score}% of job requirements. Does not meet minimum requirements."
    }


async def generate_self_introduction_with_ai(resume_text: str, target_role: str, duration: str, experience_level: str) -> dict:
    """Real AI generation with duration and experience-level as actual
    generative parameters, which the rule-based version below can't do —
    it only ever produces one fixed-length output regardless of what's
    asked for. Falls back to the rule-based version (ignoring duration/
    experience_level, since it has no way to honor them) on AI failure."""
    from app.services.ai_service import call_ai

    duration_guidance = {
        "30sec": "approximately 75-90 words, extremely concise",
        "60sec": "approximately 150-160 words",
        "3min": "approximately 450-500 words, more detailed with specific examples"
    }.get(duration, "approximately 150-160 words")

    level_guidance = {
        "fresher": "Emphasize education, projects, technical skills, and eagerness to learn — do not claim work experience they don't have.",
        "experienced": "Emphasize work history, quantified achievements, and professional growth."
    }.get(experience_level, "Emphasize education, projects, and skills appropriate to their actual background.")

    prompt = (
        f"Target role: {target_role or 'not specified'}\n"
        f"Resume:\n{resume_text[:1500]}"
    )

    ai_result = await call_ai(
        system_prompt=(
            f"Write a spoken self-introduction for a job interview, based ONLY on the resume given. "
            f"{level_guidance} Length: {duration_guidance}. Do not invent experience or achievements "
            f"not implied by the resume. Return in exactly this format with no other text:\n"
            f"FORMAL:\n<formal version>\n\nCASUAL:\n<casual version>"
        ),
        user_prompt=prompt,
        max_tokens=700,
        temperature=0.7
    )

    if ai_result and "FORMAL:" in ai_result and "CASUAL:" in ai_result:
        try:
            formal = ai_result.split("FORMAL:")[1].split("CASUAL:")[0].strip()
            casual = ai_result.split("CASUAL:")[1].strip()
        except IndexError:
            formal, casual = None, None

        if formal and casual:
            skills_found = [s for s in ["python","java","react","sql","machine learning","docker","aws","javascript","nodejs","tensorflow","pandas","git"] if s in resume_text.lower()]
            return {
                "name_detected": None,
                "skills_highlighted": skills_found[:4],
                "formal_introduction": formal,
                "casual_introduction": casual,
                "tips": [
                    "Practice your introduction until it feels natural",
                    "Make eye contact and speak confidently",
                    "Customize the role mention for each interview",
                    "End with enthusiasm about the specific company"
                ],
                "ai_generated": True
            }

    # AI unavailable or malformed response — fall back to the rule-based version
    fallback = generate_self_introduction(resume_text, target_role)
    fallback["ai_generated"] = False
    return fallback


def generate_self_introduction(resume_text: str, target_role: str = "") -> dict:
    lines = resume_text.split("\n")
    name = ""
    for line in lines[:5]:
        line = line.strip()
        if line and len(line.split()) <= 4 and line[0].isupper():
            name = line
            break

    if not name:
        name = "Your Name"

    skills_found = []
    tech_list = [
        "python", "java", "react", "sql", "machine learning", "docker",
        "aws", "javascript", "nodejs", "tensorflow", "pandas", "git"
    ]
    for skill in tech_list:
        if skill in resume_text.lower():
            skills_found.append(skill)

    has_internship = "internship" in resume_text.lower() or "intern" in resume_text.lower()
    has_projects = "project" in resume_text.lower()

    role_text = "aspiring " + target_role if target_role else "software engineering"
    skills_text = ", ".join(skills_found[:4]) if skills_found else "various technologies"

    if has_internship:
        exp_line = "and have completed internships where I applied these skills in real world projects"
    else:
        exp_line = "and have built several projects that demonstrate my practical abilities"

    if has_projects:
        project_line = "Through my projects, I have developed strong problem-solving skills and the ability to work with modern technologies."
    else:
        project_line = "I am constantly learning and building my skills through online courses and personal projects."

    if has_internship:
        internship_line = "I have had internship experience where I got to work on live projects."
    else:
        internship_line = "I have built several projects that I am really proud of."

    intro_formal = "Good morning or afternoon. My name is " + name + ".\n\nI am a passionate " + role_text + " professional currently pursuing my degree in Computer Science or Software Systems.\n\nI have hands-on experience with " + skills_text + ", " + exp_line + ".\n\n" + project_line + "\n\nI am particularly interested in this role because it aligns perfectly with my technical background and career goals. I am eager to contribute to your team and grow as a professional.\n\nThank you for this opportunity. I look forward to discussing how I can add value to your organization."

    intro_casual = "Hi! I am " + name + ", a " + role_text + " enthusiast.\n\nI work with " + skills_text + " and love building things that solve real problems. " + internship_line + "\n\nI am excited about this opportunity because I think my skills are a great fit for what you are looking for, and I am eager to learn and grow with your team!"

    return {
        "name_detected": name,
        "skills_highlighted": skills_found[:4],
        "formal_introduction": intro_formal,
        "casual_introduction": intro_casual,
        "tips": [
            "Practice your introduction until it feels natural, aim for 60 to 90 seconds",
            "Make eye contact and speak confidently",
            "Customize the role mention for each interview",
            "End with enthusiasm about the specific company",
            "Prepare a shorter 30 second version for networking events"
        ]
    }

async def generate_cover_letter_with_ai(resume_text: str, job_title: str, company_name: str, tone: str = "formal", job_description: str = "") -> dict:
    """Real AI generation respecting tone and job description, which the
    rule-based version below has never been able to do. Falls back safely
    on any AI failure."""
    from app.services.ai_service import call_ai

    tone_instructions = {
        "formal": "professional and formal",
        "friendly": "warm and conversational while still professional",
        "startup": "energetic and direct, startup culture appropriate",
        "corporate": "polished and traditional corporate tone"
    }.get(tone, "professional")

    prompt = (
        f"Job title: {job_title}\nCompany: {company_name}\n"
        + (f"Job description: {job_description}\n" if job_description.strip() else "")
        + f"\nCandidate's resume:\n{resume_text[:2000]}"
    )

    ai_result = await call_ai(
        system_prompt=(
            f"Write a {tone_instructions} cover letter for this candidate applying to this specific job. "
            "Use only real experience/skills mentioned in their resume — never invent achievements. "
            "Keep it to 3-4 short paragraphs. Do not include a header/date/address block, just the letter body."
        ),
        user_prompt=prompt,
        max_tokens=500,
        temperature=0.7
    )

    if ai_result:
        return {"cover_letter": ai_result, "ai_generated": True}

    fallback = generate_cover_letter_rule_based(resume_text, job_title, company_name)
    fallback["ai_generated"] = False
    return fallback


def generate_cover_letter_rule_based(resume_text: str, job_title: str, company_name: str) -> dict:
    lines = resume_text.split("\n")
    name = ""
    for line in lines[:5]:
        line = line.strip()
        if line and len(line.split()) <= 4 and line[0].isupper():
            name = line
            break
    if not name:
        name = "Your Name"

    skills_found = []
    tech_list = [
        "python", "java", "react", "sql", "machine learning", "docker",
        "aws", "javascript", "nodejs", "tensorflow", "pandas", "git",
        "html", "css", "flask", "django", "postgresql"
    ]
    for skill in tech_list:
        if skill in resume_text.lower():
            skills_found.append(skill)

    has_internship = "internship" in resume_text.lower()
    has_projects = "project" in resume_text.lower()

    skills_text = ", ".join(skills_found[:4]) if skills_found else "various technologies"

    if has_internship:
        exp_line = "During my internships, I have applied these skills in real-world projects and delivered measurable results."
    elif has_projects:
        exp_line = "Through my academic projects, I have built practical applications that demonstrate my technical abilities."
    else:
        exp_line = "I am constantly building my skills through self-learning and personal projects."

    letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at {company_name}. As a passionate and driven software engineering student, I believe my technical skills and enthusiasm make me an excellent candidate for this role.

I have hands-on experience with {skills_text}, which directly aligns with the requirements of this position. {exp_line}

What excites me most about {company_name} is the opportunity to work on challenging problems and grow as a professional in a dynamic environment. I am confident that my technical background, combined with my eagerness to learn, will allow me to make meaningful contributions to your team from day one.

I would welcome the opportunity to discuss how my skills and experiences align with your needs. Thank you for considering my application. I look forward to hearing from you.

Yours sincerely,
{name}"""

    return {
        "name": name,
        "job_title": job_title,
        "company_name": company_name,
        "cover_letter": letter,
        "skills_mentioned": skills_found[:4],
        "tips": [
            "Customize the cover letter for each company you apply to",
            "Research the company and mention something specific about them",
            "Keep it to one page — recruiters spend less than 30 seconds reading",
            "Use the same keywords from the job description",
            "Proofread carefully before sending"
        ]
    }