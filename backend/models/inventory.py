from pydantic import BaseModel


class DeliveryUpdate(BaseModel):
    shipment_id: str