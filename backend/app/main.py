from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(title="Digital Alpha API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://digital-alpha-takehome.netlify.app"],
    allow_credentials=False,     
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/api/hello")
def hello():
    return {"message": "Hello from Digital Alpha backend"}
