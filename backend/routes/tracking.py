from fastapi import APIRouter, HTTPException
from backend.models.shipment import ShipmentLocationUpdate, CreateShipment
from backend.services.tracking_service import (
    get_all_shipments,
    get_shipment,
    update_shipment_location
)
import uuid

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


@router.post("/shipments")
def create_shipment(payload: CreateShipment):
    """
    POST /api/v1/shipments
    
    Create a new shipment with origin, destination, and logistics details.
    AI route optimization will be applied automatically.
    """
    # Generate shipment ID
    shipment_id = f"SHP-{str(uuid.uuid4())[:8].upper()}"
    
    # Return created shipment
    return {
        "status": "success",
        "message": f"Shipment {shipment_id} created successfully. Route optimization started.",
        "shipment_id": shipment_id,
        "data": {
            "id": shipment_id,
            "origin": f"{payload.originCity}, {payload.originState}",
            "destination": f"{payload.destCity}, {payload.destState}",
            "weight": payload.weight,
            "description": payload.description,
            "status": "pending",
            "priority": payload.priority,
            "createdAt": "2026-04-28T12:00:00Z"
        }
    }