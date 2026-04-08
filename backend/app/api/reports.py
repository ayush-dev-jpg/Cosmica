# app/api/reports.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from bson import ObjectId
from app.core.security import get_current_user_optional
from app.core.database import kundlis_collection
from app.services.pdf_report import generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports"])

ALLOWED_TYPES = {"career", "marriage", "health", "general"}

class ReportRequest(BaseModel):
    kundli_id: str
    report_type: str = "general"

@router.post("/generate")
async def create_report(
    req: ReportRequest,
    current_user: dict = Depends(get_current_user_optional),
):
    if req.report_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid report type. Must be one of: {', '.join(ALLOWED_TYPES)}")

    try:
        query = {"_id": ObjectId(req.kundli_id)}
        if current_user:
            query["user_id"] = {"$in": [str(current_user["_id"]), "guest"]}
        else:
            query["user_id"] = "guest"
        kundli_doc = await kundlis_collection.find_one(query)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Kundli ID")

    if not kundli_doc:
        raise HTTPException(status_code=404, detail="Kundli not found")

    try:
        pdf_bytes = await generate_pdf_report(kundli_doc, req.report_type)
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        print(f"[PDF ERROR] {err_msg}")
        raise HTTPException(status_code=500, detail=f"PDF error: {type(e).__name__}: {e}")

    person_name = kundli_doc.get("person_name", "Chart").replace(" ", "_")
    filename = f"Cosmica_{req.report_type.title()}_Report_{person_name}.pdf"

    return Response(
        content=bytes(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
