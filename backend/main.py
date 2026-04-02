# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, kundli, predictions, chat, admin, knowledge_editor, nakshatra, moon_sign, yoga_calculator, compatibility, dasha


app = FastAPI(title="Cosmica API", version="1.0.0", docs_url="/docs", redoc_url="/redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,             prefix="/api")
app.include_router(kundli.router,           prefix="/api")
app.include_router(predictions.router,      prefix="/api")
app.include_router(chat.router,             prefix="/api")
app.include_router(admin.router,            prefix="/api")
app.include_router(knowledge_editor.router, prefix="/api")
app.include_router(nakshatra.router,        prefix="/api")
app.include_router(moon_sign.router,        prefix="/api")
app.include_router(yoga_calculator.router,  prefix="/api")
app.include_router(compatibility.router, prefix="/api")
app.include_router(dasha.router, prefix="/api")


@app.get("/")
async def root():
    return {"app": "Cosmica", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
