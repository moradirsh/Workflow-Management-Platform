from fastapi import FastAPI
from app.api import case_router
from app.core.database import Base, engine
from app.models.case import Case #type: ignore
from app.models.user import User #type: ignore
from app.models.ai_analysis import AIAnalysis #type: ignore
from app.models.activity_log import ActivityLog #type: ignore

app = FastAPI(title = "Workflow Management Platform")

#test the endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the Workflow Management Platform API"}

# Include the case API endpoints
app.include_router(case_router.router)

# Auto create postgres tables
Base.metadata.create_all(bind=engine)