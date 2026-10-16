"""
AI Service — the single place that talks to OpenAI.

Every AI-generation feature (bullet improvement today, cover letters /
self-intro / resume chat later) should route through call_ai() instead of
calling OpenAI directly from a router or another service. That keeps API
key handling, error handling, and cost-control (timeouts, max_tokens) in
one place instead of duplicated across features.

Returns None on ANY failure (missing key, network error, rate limit,
malformed response) — callers are expected to fall back to a non-AI
result rather than showing the user a broken page. Never let an OpenAI
outage take down a feature that used to work without it.
"""

import os
from typing import Optional
import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # cheap, fast model by default — override via env if desired


async def call_ai(system_prompt: str, user_prompt: str, max_tokens: int = 300, temperature: float = 0.7) -> Optional[str]:
    if not OPENAI_API_KEY:
        return None

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": OPENAI_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "max_tokens": max_tokens,
                    "temperature": temperature
                }
            )
            if response.status_code != 200:
                return None
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception:
        # Network error, timeout, malformed response, etc. — fail closed, not loudly.
        return None
