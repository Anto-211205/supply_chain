from fastapi import APIRouter
from backend.services.dashboard_service import get_dashboard_summary

router = APIRouter()


@router.get("/dashboard/summary")
def dashboard_summary():
    return get_dashboard_summary()