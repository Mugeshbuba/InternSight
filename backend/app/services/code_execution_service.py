"""
Code Execution Service — runs student-submitted code safely via Judge0
(a real sandboxed execution engine), not by exec()-ing arbitrary code
ourselves. This is why the Mock Interview coding round needed a real
third-party service rather than being buildable from scratch: safely
sandboxing arbitrary untrusted code is a genuinely hard, security-critical
problem that Judge0 already solves correctly.

Requires RAPIDAPI_KEY in the environment (free Basic Plan at
rapidapi.com/judge0-official/api/judge0-ce). Without it, execute_code()
returns a clear "not configured" result — never falls back to running
code locally/unsandboxed, since that would be a real security hole.
"""

import os
import base64
import httpx

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
JUDGE0_HOST = "judge0-ce.p.rapidapi.com"

LANGUAGE_IDS = {
    "python": 71,
    "javascript": 63,
    "java": 62,
    "cpp": 54,
    "c": 50
}


async def execute_code(source_code: str, language: str, stdin: str = "") -> dict:
    if not RAPIDAPI_KEY:
        return {
            "success": False,
            "message": "Code execution isn't configured yet — add RAPIDAPI_KEY to your backend .env "
                       "(free Basic Plan at rapidapi.com/judge0-official/api/judge0-ce) to enable this."
        }

    language_id = LANGUAGE_IDS.get(language.lower())
    if not language_id:
        return {"success": False, "message": f"Unsupported language '{language}'. Supported: {', '.join(LANGUAGE_IDS)}"}

    try:
        async with httpx.AsyncClient(timeout=25) as client:
            response = await client.post(
                f"https://{JUDGE0_HOST}/submissions",
                params={"base64_encoded": "true", "wait": "true"},
                headers={
                    "X-RapidAPI-Key": RAPIDAPI_KEY,
                    "X-RapidAPI-Host": JUDGE0_HOST,
                    "Content-Type": "application/json"
                },
                json={
                    "source_code": base64.b64encode(source_code.encode()).decode(),
                    "language_id": language_id,
                    "stdin": base64.b64encode(stdin.encode()).decode() if stdin else ""
                }
            )

            if response.status_code not in (200, 201):
                return {"success": False, "message": f"Judge0 request failed (status {response.status_code})."}

            data = response.json()

            def decode(field):
                val = data.get(field)
                return base64.b64decode(val).decode(errors="replace") if val else ""

            return {
                "success": True,
                "stdout": decode("stdout"),
                "stderr": decode("stderr"),
                "compile_output": decode("compile_output"),
                "status": data.get("status", {}).get("description", "Unknown"),
                "time": data.get("time"),
                "memory": data.get("memory")
            }
    except Exception:
        return {"success": False, "message": "Couldn't reach the code execution service — please try again."}
