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
from app.api.organization_router import router as organization_router
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.api.group_router import router as group_router
from app.api.custom_role_router import router as custom_role_router

app = FastAPI(title = "Workflow Management Platform")

# LIMIT API RATE
limiter = Limiter(key_func = get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173", "https://workflow-management-platform.vercel.app", "https://workflow-management-platform-git-main-ktmxbowgtr.vercel.app"],  # Allow all origins for development; restrict in production
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
app.include_router(organization_router)
app.include_router(group_router)
app.include_router(custom_role_router)

# Auto create required postgres tables; if new columns are added, manually delete table and re-run
Base.metadata.create_all(bind = engine)