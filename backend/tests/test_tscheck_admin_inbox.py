"""Admin inbox auth: wrong creds rejected, correct creds succeed, session-gated
endpoints 401 without cookie, PATCH status update works with session."""

import json


def test_admin_endpoints_require_session(client):
    resp = client.get("/admin/counts")
    assert resp.status_code == 401
    resp = client.get("/admin/consultations")
    assert resp.status_code == 401
    resp = client.get("/admin/referrals")
    assert resp.status_code == 401


def test_admin_login_wrong_password_rejected(client):
    resp = client.post("/admin/login", json={"email": "admin@delhivascularir.com", "password": "WrongPass123"})
    assert resp.status_code == 401


def test_admin_login_and_update_consultation_status(client):
    # create a fixture consultation to update
    create_resp = client.post("/consultations", json={
        "full_name": "tscheck-admin-flow-patient",
        "phone": "+91-9876500099",
        "area_of_concern": "Aneurysm",
        "consent": True,
    })
    assert create_resp.status_code == 201, create_resp.text
    new_id = create_resp.json()["id"]

    login_resp = client.post("/admin/login", json={"email": "admin@delhivascularir.com", "password": "VascularIR@2026"})
    assert login_resp.status_code == 200, login_resp.text
    assert login_resp.json()["email"] == "admin@delhivascularir.com"
    # httpx's stdlib-cookiejar-backed client mishandles the single-label "localhost"
    # cookie domain (real browsers do not), so pass the session cookie explicitly.
    token = login_resp.cookies.get("dvir_admin")
    auth_headers = {"Cookie": f"dvir_admin={token}"}

    me_resp = client.get("/admin/me", headers=auth_headers)
    assert me_resp.status_code == 200

    list_resp = client.get("/admin/consultations", headers=auth_headers)
    assert list_resp.status_code == 200
    ids = [c["id"] for c in list_resp.json()]
    assert new_id in ids

    patch_resp = client.patch(f"/admin/consultations/{new_id}", json={"status": "reviewed"}, headers=auth_headers)
    assert patch_resp.status_code == 200, patch_resp.text
    assert patch_resp.json()["status"] == "reviewed"

    # Logout clears the cookie client-side (session is a stateless JWT); the
    # browser check covers that signing out returns the UI to the login screen.
    logout_resp = client.post("/admin/logout", headers=auth_headers)
    assert logout_resp.status_code == 204
