from fastapi import APIRouter, HTTPException
from models.signal import SignalResponse
from services.signal_service import get_ship_signal, get_all_ship_signals

router = APIRouter()


@router.get("/ships/{ship_id}/signal-status", response_model=SignalResponse)
def get_signal_status(ship_id: str):
    data = get_ship_signal(ship_id)

    if not data:
        raise HTTPException(status_code=404, detail="Ship not found")

    return data


@router.get("/ships/signals/all")
def get_all_signals():
    return get_all_ship_signals()