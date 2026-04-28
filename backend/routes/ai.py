from fastapi import APIRouter
from backend.models.ai import DelayRequest, RouteRequest
from backend.services.ai_service import predict_delay, optimize_route

router = APIRouter()


@router.post("/ai/predict-delay")
def ai_delay(payload: DelayRequest):
    return predict_delay(payload.shipment_id)


@router.post("/ai/optimize-route")
def ai_route(payload: RouteRequest):
    return optimize_route(
        payload.from_location,
        payload.to_location,
        payload.ship_id
    )