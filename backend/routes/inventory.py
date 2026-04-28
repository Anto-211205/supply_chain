from fastapi import APIRouter
from models.inventory import DeliveryUpdate
from services.inventory_service import (
    get_inventory,
    get_low_stock,
    update_after_delivery
)

router = APIRouter()


@router.get("/inventory")
def inventory_list():
    return get_inventory()


@router.get("/inventory/low-stock")
def low_stock():
    return get_low_stock()


@router.post("/inventory/update-after-delivery")
def delivery_update(payload: DeliveryUpdate):
    return update_after_delivery(payload.shipment_id)