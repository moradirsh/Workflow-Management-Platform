from fastapi import FastAPI
from app.api import case_router
from app.core.database import Base, engine

app = FastAPI(title = "Workflow Management Platform")

#test endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the Workflow Management Platform API"}

# Include the case API endpoints
app.include_router(case_router.router)

# Create tables in Postgres automatically
Base.metadata.create_all(bind=engine)