from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import auth, incidents

# Creates tables if they don't exist yet (fine for a hackathon; use Alembic for real migrations later)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AegisAI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(incidents.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
