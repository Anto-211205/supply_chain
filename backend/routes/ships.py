from fastapi import APIRouter, HTTPException
from models.ship import CoordinateInput
from services.ship_service import (
    get_all_live_ships,
    get_ship,
    coordinate_to_grid
)

router = APIRouter()


@router.get("/ships/live")
def live_ships():
    return get_all_live_ships()


@router.get("/ships/{ship_id}")
def ship_details(ship_id: str):
    data = get_ship(ship_id)

    if not data:
        raise HTTPException(status_code=404, detail="Ship not found")

    return data


@router.post("/ships/grid-detect")
def grid_detect(payload: CoordinateInput):
    grid = coordinate_to_grid(payload.lat, payload.lon)

    return {
        "lat": payload.lat,
        "lon": payload.lon,
        "grid": grid
    }