"""Consultation form submission (create consultation) - happy path + consent rejection."""


def test_create_consultation_success(client):
    payload = {
        "full_name": "tscheck-consult-patient",
        "phone": "+91-9876500011",
        "area_of_concern": "DVT",
        "preferred_mode": "in_person",
        "message": "tscheck automated test",
        "consent": True,
    }
    resp = client.post("/consultations", json=payload)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["reference"].startswith("CONS-")
    assert len(data["id"]) > 0


def test_create_consultation_without_consent_rejected(client):
    payload = {
        "full_name": "tscheck-consult-noconsent",
        "phone": "+91-9876500012",
        "area_of_concern": "DVT",
        "consent": False,
    }
    resp = client.post("/consultations", json=payload)
    assert resp.status_code == 422, resp.text
