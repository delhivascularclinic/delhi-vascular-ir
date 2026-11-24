"""On-demand Hindi translation of a procedure's patient-mode content, cached in Mongo."""

import hashlib
import json
import logging
import os
import re
import time
import uuid

from emergentintegrations.llm.chat import LlmChat, StreamDone, TextDelta, UserMessage
from fastapi import APIRouter, HTTPException, Request

from lib.db import db
from models.translate import PatientContent, TranslationOut

router = APIRouter()
logger = logging.getLogger(__name__)
_hits: dict[str, list[float]] = {}

SYSTEM = (
    "You translate patient-education text about medical procedures from English into clear, simple Hindi "
    "(Devanagari) for patients and families in Delhi. Keep medical abbreviations and device names (EVAR, TACE, stent, "
    "catheter) recognisable, adding the Hindi word where helpful. Do not add, remove or soften any medical meaning, "
    "risks or caveats. Reply with ONLY a JSON object with exactly the same keys and list lengths as the input."
)


def _rate(ip: str) -> None:
    now = time.time()
    recent = [t for t in _hits.get(ip, []) if now - t < 3600]
    if len(recent) >= 40:
        raise HTTPException(status_code=429, detail="Too many translation requests. Please try later.")
    recent.append(now)
    _hits[ip] = recent


async def _translate_content(chat: LlmChat, src: dict, expected_steps: int) -> PatientContent:
    """Stream the model reply and parse it into PatientContent; raises on any malformed output."""
    text = ""
    async for ev in chat.stream_message(UserMessage(text=json.dumps(src, ensure_ascii=False))):
        if isinstance(ev, TextDelta):
            text += ev.content
        elif isinstance(ev, StreamDone):
            break
    m = re.search(r"\{.*\}", text, re.S)
    out = PatientContent.model_validate_json(m.group(0) if m else text)
    if len(out.steps) != expected_steps:
        raise ValueError("step count mismatch")
    return out


@router.post("/translate/{slug}", response_model=TranslationOut)
async def translate(slug: str, body: PatientContent, request: Request):
    if not re.fullmatch(r"[a-z0-9-]{2,60}", slug):
        raise HTTPException(status_code=404, detail="Unknown procedure")
    src = body.model_dump()
    key = hashlib.sha256((slug + json.dumps(src, sort_keys=True)).encode()).hexdigest()
    cached = await db.translations.find_one({"key": key}, {"_id": 0})
    if cached:
        return TranslationOut(slug=slug, lang="hi", cached=True, content=PatientContent(**cached["content"]))
    _rate(request.client.host if request.client else "unknown")

    chat = LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"], session_id=f"tr-{uuid.uuid4()}", system_message=SYSTEM) \
        .with_model("gemini", "gemini-3-flash-preview")
    try:
        out = await _translate_content(chat, src, expected_steps=len(body.steps))
    except Exception as e:  # noqa: BLE001
        logger.error(f"Translation failed for {slug}: {e}")
        raise HTTPException(status_code=502, detail="Hindi translation is unavailable right now. Please try again.")
    await db.translations.update_one({"key": key}, {"$set": {"key": key, "slug": slug, "content": out.model_dump()}}, upsert=True)
    return TranslationOut(slug=slug, lang="hi", cached=False, content=out)
