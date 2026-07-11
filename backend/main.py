import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from backend.database import engine, Base
from backend.routers import auth, incidents

# Creates tables if they don't exist yet (fine for a hackathon; use Alembic for real migrations later)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AegisAI API", version="0.1.0")

# --- Rate limiting: protects auth endpoints from brute-force / credential-stuffing ---
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS: only the frontend origins we actually run locally, not a wildcard ---
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(incidents.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}