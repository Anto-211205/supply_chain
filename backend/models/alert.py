from pydantic import BaseModel


class AlertResponse(BaseModel):
    ship_id: str
    zone: str
    risk_level: str
    alert: str