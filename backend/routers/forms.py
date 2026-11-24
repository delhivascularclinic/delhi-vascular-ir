"""Public submission endpoints. They only ever return a receipt — never stored data."""

import os
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from lib.db import db
from lib.email import notify_consultation, notify_referral
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


def _check_ext(f: UploadFile) -> None:
    ext = Path(f.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"File type {ext or '(none)'} not allowed")


async def _save_upload(f: UploadFile) -> Attachment:
    """Stream one upload to disk under an opaque id (never the user's filename).
    Removes its own partial file if it exceeds the size limit."""
    att = Attachment(filename=Path(f.filename or "file").name[:150],
                     content_type=f.content_type or "application/octet-stream", size=0)
    dest = upload_dir() / att.id
    try:
        with dest.open("wb") as out:
            while chunk := await f.read(1024 * 1024):
                att.size += len(chunk)
                if att.size > MAX_BYTES:
                    raise HTTPException(status_code=400, detail=f"{att.filename} exceeds 25 MB")
                out.write(chunk)
    except BaseException:
        dest.unlink(missing_ok=True)
        raise
    return att


@router.post("/consultations", response_model=SubmissionReceipt, status_code=201)
async def create_consultation(body: ConsultationCreate, bg: BackgroundTasks):
    item = Consultation(**body.model_dump())
    await db.consultations.insert_one(item.model_dump())
    ref = _reference("CONS", item.id)
    bg.add_task(notify_consultation, item.model_dump(), ref)
    return SubmissionReceipt(id=item.id, reference=ref)


@router.post("/referrals", response_model=SubmissionReceipt, status_code=201)
async def create_referral(bg: BackgroundTasks, payload: str = Form(...), files: list[UploadFile] = File(default=[])):
    try:
        body = ReferralCreate.model_validate_json(payload)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors(include_url=False, include_context=False))
    files = [f for f in files if f.filename]
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_FILES} files per referral")

    for f in files:  # validate every file type before writing anything
        _check_ext(f)
    attachments: list[Attachment] = []
    try:
        for f in files:
            attachments.append(await _save_upload(f))
    except HTTPException:
        for a in attachments:  # roll back files already saved for this referral
            (upload_dir() / a.id).unlink(missing_ok=True)
        raise

    item = Referral(**body.model_dump(), attachments=attachments)
    await db.referrals.insert_one(item.model_dump())
    ref = _reference("REF", item.id)
    bg.add_task(notify_referral, item.model_dump(), ref)
    return SubmissionReceipt(id=item.id, reference=ref)
