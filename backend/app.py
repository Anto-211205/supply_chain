import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


load_dotenv(Path(__file__).resolve().parent / ".env")

# Import Routers
from backend.routes.dashboard import router as dashboard_router
from backend.routes.tracking import router as tracking_router
from backend.routes.ships import router as ships_router
from backend.routes.inventory import router as inventory_router
from backend.routes.alerts import router as alerts_router
from backend.routes.ai import router as ai_router
from backend.routes.chatbot import router as chatbot_router
from backend.routes.signals import router as signals_router
from backend.routes.auth import router as auth_router
from backend.routes.company import router as company_router


app = FastAPI(
    title="AI Smart Supply Chain Backend",
    version="1.0.0",
    description="Supply Chain + Maritime Logistics + AI APIs"
)

# CORS — read allowed origins from env var (comma-separated list).
# Falls back to localhost:5173 for local development.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root Health Check
@app.get("/")
def root():
    return {
        "message": "Supply Chain Backend Running",
        "version": "1.0.0"
    }


# API Routers
app.include_router(dashboard_router, prefix="/api/v1", tags=["Dashboard"])
app.include_router(tracking_router, prefix="/api/v1", tags=["Tracking"])
app.include_router(ships_router, prefix="/api/v1", tags=["Ships"])
app.include_router(inventory_router, prefix="/api/v1", tags=["Inventory"])
app.include_router(alerts_router, prefix="/api/v1", tags=["Alerts"])
app.include_router(ai_router, prefix="/api/v1", tags=["AI"])
app.include_router(chatbot_router, prefix="/api/v1", tags=["Chatbot"])
app.include_router(signals_router, prefix="/api/v1", tags=["Signals"])
app.include_router(auth_router, prefix="/api/v1", tags=["Auth"])
app.include_router(company_router, prefix="/api/v1", tags=["Company"])
