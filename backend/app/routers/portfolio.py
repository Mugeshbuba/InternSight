from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.deployment_service import deploy_portfolio

router = APIRouter(prefix="/portfolio", tags=["Portfolio Deployment"])


class DeployRequest(BaseModel):
    html: str
    site_name: Optional[str] = None


@router.post("/deploy")
async def deploy(request: DeployRequest):
    return await deploy_portfolio(request.html, request.site_name)
