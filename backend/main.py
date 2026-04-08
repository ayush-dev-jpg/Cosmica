# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import auth, kundli, predictions, chat, admin, knowledge_editor, nakshatra, moon_sign, yoga_calculator, dasha, reports

app = FastAPI(title="Cosmica API", version="1.0.0", docs_url="/docs", redoc_url="/redoc")

# Handle OPTIONS preflight explicitly
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
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
app.include_router(dasha.router,            prefix="/api")
app.include_router(reports.router,          prefix="/api")

@app.get("/")
async def root():
    return {"app": "Cosmica", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
