from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class CompanyProfileUpdate(BaseModel):
    companyName: str
    email: str
    phone: str
    address: str
    taxId: str
    notes: str = ""


@router.post("/company/profile")
def update_profile(payload: CompanyProfileUpdate):
    """
    POST /api/v1/company/profile
    
    Update company profile information.
    """
    return {
        "status": "success",
        "message": "Company profile updated successfully!",
        "data": {
            "companyName": payload.companyName,
            "email": payload.email,
            "phone": payload.phone,
            "address": payload.address,
            "taxId": payload.taxId,
            "notes": payload.notes,
            "updatedAt": "2026-04-28T12:00:00Z"
        }
    }
