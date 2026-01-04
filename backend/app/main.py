from fastapi import FastAPI

# attempting to solve issue with circular imports
app = FastAPI(title="Workflow Management Platform")

@app.get("/")
def root():
    return {"message": "API is running"}
