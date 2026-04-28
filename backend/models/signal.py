from pydantic import BaseModel


class Location(BaseModel):
    lat: float
    lon: float


class SignalResponse(BaseModel):
    ship_id: str
    ship_name: str
    last_signal: str
    status: str
    signal_strength_dbm: int
    quality: str
    location: Location