from fastapi import APIRouter, HTTPException
from backend.models.shipment import ShipmentLocationUpdate
from backend.services.tracking_service import (
    get_all_shipments,
    get_shipment,
    update_shipment_location
)

router = APIRouter()


@router.get("/shipments")
def all_shipments():
    return get_all_shipments()


@router.get("/shipments/{shipment_id}")
def shipment_by_id(shipment_id: str):
    data = get_shipment(shipment_id)

    if not data:
        raise HTTPException(status_code=404, detail="Shipment not found")

    return data


@router.put("/shipments/{shipment_id}/location")
def update_location(shipment_id: str, payload: ShipmentLocationUpdate):
    data = update_shipment_location(
        shipment_id,
        payload.lat,
        payload.lon,
        payload.status
    )

    if not data:
        raise HTTPException(status_code=404, detail="Shipment not found")

    return data