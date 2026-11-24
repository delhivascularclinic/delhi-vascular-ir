"""Referral upload validation & rollback (_save_upload/_check_ext refactor):
.exe rejection, >25MB rejection with no residual files on disk, valid .pdf accepted."""

import io
import json
import os
from pathlib import Path

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "/app/backend/uploads"))


def _payload(name="tscheck-upload-rollback-patient"):
    return {
        "referrer_name": "tscheck-referral-doctor-upload",
        "referrer_institution": "tscheck Test Hospital",
        "referrer_phone": "+91-9876500044",
        "referrer_email": "tscheck-upload@example.com",
        "patient_name": name,
        "category": "Vascular",
        "clinical_summary": "tscheck automated referral for upload validation testing.",
        "consent": True,
    }


def _existing_files() -> set:
    if not UPLOAD_DIR.exists():
        return set()
    return {p.name for p in UPLOAD_DIR.iterdir()}


def test_oversize_pdf_rejected_and_rolled_back(client):
    before = _existing_files()
    small_pdf = ("tscheck-small.pdf", io.BytesIO(b"%PDF-1.4 small"), "application/pdf")
    big_body = b"%PDF-1.4 " + (b"A" * (26 * 1024 * 1024))
    big_pdf = ("tscheck-big.pdf", io.BytesIO(big_body), "application/pdf")
    files = [("files", small_pdf), ("files", big_pdf)]
    resp = client.post("/referrals", data={"payload": json.dumps(_payload())}, files=files)
    assert resp.status_code == 400, resp.text
    assert "exceeds 25 MB" in resp.json()["detail"]

    after = _existing_files()
    # No new files should remain on disk after the rollback (small file saved first is removed too).
    assert after == before, f"leftover upload files after rollback: {after - before}"


def test_valid_pdf_accepted(client):
    files = [("files", ("tscheck-valid.pdf", io.BytesIO(b"%PDF-1.4 tscheck ok"), "application/pdf"))]
    resp = client.post("/referrals", data={"payload": json.dumps(_payload("tscheck-valid-upload-patient"))}, files=files)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["reference"].startswith("REF-")
    assert len(data["reference"]) == len("REF-") + 8
