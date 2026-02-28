from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import landmarks
from app.config.settings import settings

app = FastAPI(title="Vision Analytics Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(landmarks.router, prefix="/ws")
app.include_router(landmarks.router, prefix="/internal")


@app.get("/health")
async def health():
    return {"status": "ok"}
