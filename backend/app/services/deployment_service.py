"""
Deployment Service — publishes a generated portfolio to a real live URL.

Uses Netlify's single-call zip deploy API: POST a zip containing index.html
to /sites and Netlify creates a new site with that content live immediately,
returning its URL. No multi-step upload negotiation needed.

Requires NETLIFY_TOKEN in the environment (a free Personal Access Token
from app.netlify.com/user/applications). Without it, deploy_portfolio()
returns a clear "not configured" result rather than failing silently or
pretending to have deployed something.
"""

import os
import io
import zipfile
import httpx

NETLIFY_TOKEN = os.getenv("NETLIFY_TOKEN")


async def deploy_portfolio(html_content: str, site_name: str = None) -> dict:
    if not NETLIFY_TOKEN:
        return {
            "success": False,
            "message": "Live hosting isn't configured yet — add NETLIFY_TOKEN to your backend .env "
                       "(free token from app.netlify.com/user/applications) to enable this."
        }

    # Build an in-memory zip containing just index.html — Netlify's zip deploy
    # expects the site's file structure at the zip root.
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("index.html", html_content)
    buffer.seek(0)

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            params = {"name": site_name} if site_name else {}
            response = await client.post(
                "https://api.netlify.com/api/v1/sites",
                headers={
                    "Authorization": f"Bearer {NETLIFY_TOKEN}",
                    "Content-Type": "application/zip"
                },
                params=params,
                content=buffer.read()
            )

            if response.status_code not in (200, 201):
                return {
                    "success": False,
                    "message": f"Netlify deploy failed (status {response.status_code}). "
                               "Check your NETLIFY_TOKEN is valid."
                }

            data = response.json()
            return {
                "success": True,
                "url": data.get("ssl_url") or data.get("url"),
                "site_id": data.get("site_id")
            }
    except Exception:
        return {"success": False, "message": "Couldn't reach Netlify right now — please try again."}
