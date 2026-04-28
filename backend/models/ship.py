from pydantic import BaseModel


class CoordinateInput(BaseModel):
    lat: float
    lon: float