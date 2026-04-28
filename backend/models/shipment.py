from pydantic import BaseModel


class ShipmentLocationUpdate(BaseModel):
    lat: float
    lon: float
    status: str