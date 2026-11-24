"""Admin session decode refactor (_decode_session): invalid/garbage cookie must be
rejected with 401 'Session expired', distinct from the missing-cookie 401."""


def test_admin_missing_cookie_rejected(client):
    resp = client.get("/admin/consultations")
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Not authenticated"


def test_admin_invalid_cookie_session_expired(client):
    resp = client.get("/admin/consultations", headers={"Cookie": "dvir_admin=not-a-valid-jwt-token"})
    assert resp.status_code == 401, resp.text
    assert resp.json()["detail"] == "Session expired"
