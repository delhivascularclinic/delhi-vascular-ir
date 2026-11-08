"""Admin inbox — every route except login requires the admin session cookie."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import FileResponse

from lib.auth import check_rate, clear_session, record_failure, require_admin, set_session, verify_credentials
from lib.db import db
from models.forms import AdminLogin, AdminMe, Consultation, InboxCounts, Referral, StatusUpdate
from routers.forms import upload_dir

router = APIRouter(prefix="/admin")


@router.post("/login", response_model=AdminMe)
async def login(body: AdminLogin, request: Request, response: Response):
    ip = request.client.host if request.client else "unknown"
    check_rate(ip)
    if not verify_credentials(body.email, body.password):
        record_failure(ip)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_session(response, body.email.lower())
    return AdminMe(email=body.email.lower())


@router.post("/logout", status_code=204)
async def logout(response: Response):
    clear_session(response)


@router.get("/me", response_model=AdminMe)
async def me(email: str = Depends(require_admin)):
    return AdminMe(email=email)


@router.get("/counts", response_model=InboxCounts)
async def counts(_: str = Depends(require_admin)):
    return InboxCounts(
        consultations_new=await db.consultations.count_documents({"status": "new"}),
        referrals_new=await db.referrals.count_documents({"status": "new"}),
    )


@router.get("/consultations", response_model=list[Consultation])
async def list_consultations(_: str = Depends(require_admin)):
    docs = await db.consultations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Consultation(**d) for d in docs]


@router.get("/referrals", response_model=list[Referral])
async def list_referrals(_: str = Depends(require_admin)):
    docs = await db.referrals.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Referral(**d) for d in docs]


@router.patch("/consultations/{id}", response_model=Consultation)
async def update_consultation(id: str, body: StatusUpdate, _: str = Depends(require_admin)):
    doc = await db.consultations.find_one_and_update({"id": id}, {"$set": {"status": body.status}},
                                                     projection={"_id": 0}, return_document=True)
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return Consultation(**doc)


@router.patch("/referrals/{id}", response_model=Referral)
async def update_referral(id: str, body: StatusUpdate, _: str = Depends(require_admin)):
    doc = await db.referrals.find_one_and_update({"id": id}, {"$set": {"status": body.status}},
                                                 projection={"_id": 0}, return_document=True)
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return Referral(**doc)


@router.get("/files/{file_id}")
async def download_file(file_id: str, _: str = Depends(require_admin)):
    doc = await db.referrals.find_one({"attachments.id": file_id}, {"_id": 0, "attachments": 1})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    att = next(a for a in doc["attachments"] if a["id"] == file_id)
    path = upload_dir() / file_id
    if not path.exists():
        raise HTTPException(status_code=404, detail="File missing on server")
    return FileResponse(path, media_type=att["content_type"], filename=att["filename"])
