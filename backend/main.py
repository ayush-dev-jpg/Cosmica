# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, kundli, predictions, chat, admin, knowledge_editor, nakshatra, moon_sign, yoga_calculator

app = FastAPI(
    title="Cosmica API",
    description="Vedic Astrology Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://cosmica.app",
        "https://cosmica-three.vercel.app",
        "https://*.vercel.app",
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

@app.get("/")
async def root():
    return {"app": "Cosmica", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
