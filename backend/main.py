from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Allow frontend during dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/greet")
def greet(name: str = "world"):
    return {"message": f"Hello, {name}!"}


@app.get("/api/random")
def greet(name: str = "world"):
    return {"value": random.randint(1, 100)}
