from fastapi import APIRouter, HTTPException
from backend.models.alert import AlertResponse
from backend.services.alert_service import (
    get_risk_zones,
    get_ship_risk,
    get_all_alerts
)

router = APIRouter()


@router.get("/zones/risk")
def zones():
    return get_risk_zones()


@router.get("/ships/{ship_id}/risk-status", response_model=AlertResponse)
def risk_status(ship_id: str):
    data = get_ship_risk(ship_id)

    if not data:
        raise HTTPException(status_code=404, detail="Ship not found")

    return data


@router.get("/alerts")
def alerts():
    return get_all_alerts()