from pydantic import BaseModel


class ShipmentLocationUpdate(BaseModel):
    lat: float
    lon: float
    status: str


class CreateShipment(BaseModel):
    description: str
    weight: str
    dimensions: str
    origin: str
    originCity: str
    originState: str
    originZip: str
    destination: str
    destCity: str
    destState: str
    destZip: str
    pickupDate: str = None
    deliveryDate: str = None
    priority: str = "standard"