from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .routes import readings, agent

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tarot API",
    description="塔罗牌占卜 API",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(readings.router)
app.include_router(agent.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "tarot-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}
