"""Referral form submission with attachment - happy path, .exe rejection, and
unauthenticated file download rejection (401)."""

import io

import httpx


def _payload():
    return {
        "referrer_name": "tscheck-referral-doctor",
        "referrer_qualification": "MBBS",
        "referrer_institution": "tscheck Test Hospital",
        "referrer_phone": "+91-9876500033",
        "referrer_email": "tscheck-referrer@example.com",
        "patient_name": "tscheck-referral-patient",
        "patient_age": 45,
        "patient_sex": "male",
        "category": "Vascular",
        "urgency": "routine",
        "clinical_summary": "tscheck automated referral clinical summary for testing.",
        "consent": True,
    }


def test_create_referral_with_pdf_attachment(client):
    import json

    files = [("files", ("tscheck-scan.pdf", io.BytesIO(b"%PDF-1.4 tscheck fake pdf content"), "application/pdf"))]
    resp = client.post("/referrals", data={"payload": json.dumps(_payload())}, files=files)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["reference"].startswith("REF-")
    referral_id = data["id"]

    # file id isn't returned directly in receipt; fetch via unauthenticated attempt should 401
    resp2 = httpx.get(f"{client.base_url}/admin/files/{referral_id}")
    assert resp2.status_code in (401, 404)


def test_create_referral_rejects_exe_attachment(client):
    import json

    files = [("files", ("tscheck-malware.exe", io.BytesIO(b"MZ fake exe content"), "application/octet-stream"))]
    resp = client.post("/referrals", data={"payload": json.dumps(_payload())}, files=files)
    assert resp.status_code == 400, resp.text


def test_admin_files_requires_auth(client):
    resp = client.get("/admin/files/some-fake-id")
    assert resp.status_code == 401, resp.text
