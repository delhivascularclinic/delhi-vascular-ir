"""Public submission endpoints. They only ever return a receipt — never stored data."""

import os
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from lib.db import db
from models.forms import Attachment, Consultation, ConsultationCreate, Referral, ReferralCreate, SubmissionReceipt

router = APIRouter()

ALLOWED_EXT = {".pdf", ".jpg", ".jpeg", ".png", ".dcm", ".zip", ".doc", ".docx"}
MAX_FILES = 5
MAX_BYTES = 25 * 1024 * 1024


def upload_dir() -> Path:
    p = Path(os.environ.get("UPLOAD_DIR", "/app/backend/uploads"))
    p.mkdir(parents=True, exist_ok=True)
    return p


def _reference(prefix: str, id_: str) -> str:
    return f"{prefix}-{id_[:8].upper()}"


@router.post("/consultations", response_model=SubmissionReceipt, status_code=201)
async def create_consultation(body: ConsultationCreate):
    item = Consultation(**body.model_dump())
    await db.consultations.insert_one(item.model_dump())
    return SubmissionReceipt(id=item.id, reference=_reference("CONS", item.id))


@router.post("/referrals", response_model=SubmissionReceipt, status_code=201)
async def create_referral(payload: str = Form(...), files: list[UploadFile] = File(default=[])):
    try:
        body = ReferralCreate.model_validate_json(payload)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors(include_url=False, include_context=False))
    files = [f for f in files if f.filename]
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_FILES} files per referral")

    attachments: list[Attachment] = []
    written: list[Path] = []
    try:
        for f in files:
            ext = Path(f.filename or "").suffix.lower()
            if ext not in ALLOWED_EXT:
                raise HTTPException(status_code=400, detail=f"File type {ext or '(none)'} not allowed")
            att = Attachment(filename=Path(f.filename or "file").name[:150],
                             content_type=f.content_type or "application/octet-stream", size=0)
            dest = upload_dir() / att.id  # stored by opaque id, never by user filename
            size = 0
            with dest.open("wb") as out:
                while chunk := await f.read(1024 * 1024):
                    size += len(chunk)
                    if size > MAX_BYTES:
                        raise HTTPException(status_code=400, detail=f"{att.filename} exceeds 25 MB")
                    out.write(chunk)
            written.append(dest)
            att.size = size
            attachments.append(att)
    except HTTPException:
        for p in written:
            p.unlink(missing_ok=True)
        (upload_dir() / (attachments[-1].id if attachments else "_")).unlink(missing_ok=True)
        raise

    item = Referral(**body.model_dump(), attachments=attachments)
    await db.referrals.insert_one(item.model_dump())
    return SubmissionReceipt(id=item.id, reference=_reference("REF", item.id))
