from fastapi import FastAPI
from app.api import case_router
from app.core.database import Base, engine
from app.models.case import Case #type: ignore
from app.models.user import User #type: ignore
from app.models.ai_analysis import AIAnalysis #type: ignore
from app.models.activity_log import ActivityLog #type: ignore
from app.api.user_router import router as user_router 
from fastapi.middleware.cors import CORSMiddleware
from app.api.comment_router import router as comment_router



app = FastAPI(title = "Workflow Management Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],  # Allow all origins for development; restrict in production
    allow_methods = ["*"],
    allow_headers = ["*"],
    allow_credentials = True,
)

# base endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the Workflow Management Platform API"}

# Include the case API endpoints
app.include_router(user_router)
app.include_router(case_router.router)
app.include_router(comment_router)

# Auto create required postgres tables; if new columns are added, manually delete table and re-run
Base.metadata.create_all(bind = engine)