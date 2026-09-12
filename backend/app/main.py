from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import init_db
from app.routers import auth, users, committees, members, meetings, minutes, actions, documents, compliance, ai, reports, notifications
from app.notifications.scheduler import start_scheduler, stop_scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Vignan CommiAI API...")
    try:
        init_db()
    except Exception as e:
        logger.warning(f"DB init warning: {e}")
    
    # Configure LangSmith if available
    if settings.LANGCHAIN_API_KEY:
        import os
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
        os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT
        logger.info("LangSmith tracing enabled")
    
    # Start background notification scheduler
    try:
        start_scheduler(interval_seconds=300)
    except Exception as e:
        logger.warning(f"Failed to start notification scheduler: {e}")
    
    yield
    
    # Shutdown
    stop_scheduler()
    logger.info("Shutting down...")


import socketio
from app.realtime.socket_manager import sio

fastapi_app = FastAPI(
    title="Vignan CommiAI API",
    description="AI-Powered Committee Management Platform for Vignan University",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include routers
fastapi_app.include_router(auth.router)
fastapi_app.include_router(users.router)
fastapi_app.include_router(committees.router)
fastapi_app.include_router(members.router)
fastapi_app.include_router(meetings.router)
fastapi_app.include_router(minutes.router)
fastapi_app.include_router(actions.router)
fastapi_app.include_router(documents.router)
fastapi_app.include_router(compliance.router)
fastapi_app.include_router(ai.router)
fastapi_app.include_router(reports.router)
fastapi_app.include_router(notifications.router)


@fastapi_app.get("/health")
async def health():
    return {"status": "ok", "app": "Vignan CommiAI", "version": "1.0.0"}


@fastapi_app.get("/")
async def root():
    return {"message": "Vignan CommiAI API", "docs": "/docs"}


# Top-level ASGI app supporting both Socket.io WebSockets and REST APIs
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path="socket.io")

