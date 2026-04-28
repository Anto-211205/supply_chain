from pydantic import BaseModel


class DelayRequest(BaseModel):
    shipment_id: str


class RouteRequest(BaseModel):
    from_location: str
    to_location: str
    ship_id: str