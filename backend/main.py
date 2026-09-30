import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.database import Base, engine
from app.routers import (
    dashboard, goals, habits, logs, 
    categories, analytics, winter_arc, 
    data_safety, settings as settings_router
)

# Initialize database schema tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Winter Arc Tracker API",
    description="Personal goal, habit, and progress tracking dashboard API",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(dashboard.router)
app.include_router(goals.router)
app.include_router(habits.router)
app.include_router(logs.router)
app.include_router(categories.router)
app.include_router(analytics.router)
app.include_router(winter_arc.router)
app.include_router(data_safety.router)
app.include_router(settings_router.router)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Winter Arc Tracker API"}

# Serve Frontend static build when available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api/"):
            return {"error": "API route not found"}
        
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.API_HOST, port=settings.API_PORT, reload=settings.DEBUG)
