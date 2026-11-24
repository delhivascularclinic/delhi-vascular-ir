"""Hindi translate endpoint refactor (_translate_content): cached hit for evar's real
patient content (seeded per briefing), bad slug -> 404, malformed body -> 422."""


EVAR_PATIENT_CONTENT = {
    "title": "EVAR — Endovascular Aneurysm Repair",
    "summary": "Relining a ballooned aorta from inside with a fabric stent graft.",
    "patient": (
        "An abdominal aortic aneurysm is a weakened, enlarged section of the main artery in the tummy. "
        "If it grows large, it can rupture. In EVAR, a fabric-covered stent graft is passed up through the "
        "groin arteries and opened inside the aorta, so blood flows through the graft and pressure on the "
        "aneurysm wall is reduced."
    ),
    "steps": [
        "The normal aorta carries blood to the pelvis and legs.",
        "A weakened section balloons out — an aortic aneurysm.",
        "CT planning measures the aorta and groin arteries.",
        "Wires and a delivery system pass up from both groins.",
        "The graft body, then the opposite limb, are deployed.",
        "Blood flows through the graft; the aneurysm is excluded.",
    ],
    "indications": [
        "AAA ≥5.5 cm (men) / ≥5.0 cm (women), or rapid growth",
        "Symptomatic aneurysm",
        "Anatomy suitable for endovascular seal after CTA review",
    ],
    "risks": [
        "Endoleak requiring further intervention",
        "Graft limb occlusion or migration",
        "Access-vessel injury; kidney injury from contrast",
        "Need for lifelong imaging follow-up",
    ],
    "alternatives": [
        "Open surgical aneurysm repair",
        "Surveillance imaging for smaller aneurysms",
        "Fenestrated/branched repair for complex necks (selected centres)",
    ],
}


def test_translate_evar_cached_hit(client):
    resp = client.post("/translate/evar", json=EVAR_PATIENT_CONTENT)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["slug"] == "evar"
    assert data["lang"] == "hi"
    assert data["cached"] is True, "expected a pre-seeded cache hit for evar's exact patient content"
    assert len(data["content"]["steps"]) == 6


def test_translate_bad_slug_404(client):
    resp = client.post("/translate/BAD_SLUG!", json=EVAR_PATIENT_CONTENT)
    assert resp.status_code == 404, resp.text


def test_translate_malformed_body_422(client):
    resp = client.post("/translate/evar", json={"title": "x"})
    assert resp.status_code == 422, resp.text
