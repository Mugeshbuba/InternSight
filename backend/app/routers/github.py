import os
import re
from collections import Counter
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/github", tags=["GitHub Integration"])

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # optional — raises rate limit from 60/hr to 5000/hr if set


def _github_headers():
    headers = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


def extract_username(url_or_username: str) -> str:
    """Accepts a raw username, a full GitHub URL, or a URL missing the protocol."""
    cleaned = url_or_username.strip().rstrip("/")
    match = re.search(r"github\.com/([A-Za-z0-9_-]+)", cleaned)
    if match:
        return match.group(1)
    return cleaned.split("/")[0]


@router.get("/stats/{username_or_url:path}")
async def get_github_stats(username_or_url: str):
    username = extract_username(username_or_url)
    if not username:
        raise HTTPException(status_code=400, detail="No GitHub username provided")

    async with httpx.AsyncClient(timeout=10) as client:
        profile_res = await client.get(f"https://api.github.com/users/{username}", headers=_github_headers())

        if profile_res.status_code == 404:
            raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found")
        if profile_res.status_code == 403:
            raise HTTPException(
                status_code=429,
                detail="GitHub API rate limit reached. Add a GITHUB_TOKEN to your backend .env to raise this limit."
            )
        if profile_res.status_code != 200:
            raise HTTPException(status_code=502, detail="Couldn't reach GitHub right now")

        profile = profile_res.json()

        repos_res = await client.get(
            f"https://api.github.com/users/{username}/repos",
            params={"per_page": 100, "sort": "pushed"},
            headers=_github_headers()
        )
        repos = repos_res.json() if repos_res.status_code == 200 else []

    language_counts = Counter(r["language"] for r in repos if r.get("language"))
    top_languages = [lang for lang, _ in language_counts.most_common(6)]

    top_repos = sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)[:4]
    top_repos_summary = [
        {
            "name": r["name"],
            "description": r.get("description"),
            "stars": r.get("stargazers_count", 0),
            "language": r.get("language"),
            "url": r.get("html_url")
        }
        for r in top_repos
    ]

    return {
        "username": profile.get("login"),
        "avatar_url": profile.get("avatar_url"),
        "bio": profile.get("bio"),
        "public_repos": profile.get("public_repos", 0),
        "followers": profile.get("followers", 0),
        "profile_url": profile.get("html_url"),
        "top_languages": top_languages,
        "top_repos": top_repos_summary
    }
