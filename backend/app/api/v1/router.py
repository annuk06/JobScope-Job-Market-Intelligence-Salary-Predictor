"""API v1 master router."""
from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.predict import router as predict_router
from app.api.v1.skill_gap import router as skill_gap_router
from app.api.v1.dataset import router as dataset_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health"])
api_router.include_router(dashboard_router, tags=["Dashboard"])
api_router.include_router(analytics_router, tags=["Analytics"])
api_router.include_router(jobs_router, tags=["Jobs"])
api_router.include_router(predict_router, tags=["Prediction & Models"])
api_router.include_router(skill_gap_router, tags=["Skill Gap"])
api_router.include_router(dataset_router, tags=["Dataset"])
