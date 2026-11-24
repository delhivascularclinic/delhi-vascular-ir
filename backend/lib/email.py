"""Emergent-managed email (Resend proxy). Only server-side templates, only the clinic inbox as recipient."""

import ipaddress
import logging
import os
import re
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()
logger = logging.getLogger(__name__)

EMAIL_BASE_URL = "https://integrations.emergentagent.com"

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _check_no_forms(scan: _EmailScan) -> None:
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")


def _check_no_credential_asks(subject: str, html: str) -> None:
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")


def _check_urls(scan: _EmailScan) -> None:
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")


def _check_anchor_hosts(scan: _EmailScan) -> None:
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} ≠ real link host {real!r} (G3)")


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    _check_no_forms(scan)
    _check_no_credential_asks(subject, html)
    _check_urls(scan)
    _check_anchor_hosts(scan)


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": os.environ["EMAIL_FROM_NAME"]}
    rt = reply_to or os.environ.get("EMAIL_REPLY_TO")
    if rt:
        payload["contact_email"] = rt
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                                     headers={"X-Email-Key": os.environ["EMERGENT_EMAIL_KEY"]}, json=payload)
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        try:
            code = e.response.json().get("code", "")
        except ValueError:
            code = ""
        if code in ("insufficient_credits", "integration_disabled", "daily_limit_reached"):
            logger.warning(f"Email paused: {code} ({e.response.status_code}): {e.response.text}")
            raise HTTPException(status_code=503, detail="Email is temporarily unavailable")
        logger.error(f"Email send failed: {e.response.status_code} {e.response.text}")
        raise HTTPException(status_code=502, detail="Failed to send email")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Email send error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")


def _row(label: str, value) -> str:
    if value in (None, ""):
        return ""
    return (f'<tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:13px;vertical-align:top">{escape(label)}</td>'
            f'<td style="padding:4px 0;color:#0f172a;font-size:14px;white-space:pre-line">{escape(str(value))}</td></tr>')


def _wrap(title: str, rows: str, note: str) -> str:
    site = os.environ.get("PUBLIC_SITE_URL", "").rstrip("/")
    brand = escape(os.environ["EMAIL_FROM_NAME"])
    link = (f'<p style="margin:20px 0 0"><a href="{escape(site)}/admin" style="background:#00B8B0;color:#071525;'
            f'padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Open the staff inbox</a></p>'
            if site.startswith("https://") else "")
    return (f'<table role="presentation" width="100%" style="background:#f8fafc"><tr><td style="padding:24px;font-family:Arial,sans-serif">'
            f'<table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px">'
            f'<tr><td style="background:#071525;color:#52D6E8;padding:16px 24px;font-size:12px;letter-spacing:2px">{brand.upper()}</td></tr>'
            f'<tr><td style="padding:24px"><h2 style="margin:0 0 16px;color:#0f172a;font-size:20px">{escape(title)}</h2>'
            f'<table role="presentation">{rows}</table><p style="margin:16px 0 0;color:#475569;font-size:13px">{escape(note)}</p>{link}'
            f'<p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Automatic notification sent by {brand} website.</p></td></tr></table>'
            f'</td></tr></table>')


async def notify_consultation(doc: dict, reference: str) -> None:
    try:
        rows = "".join([_row("Reference", reference), _row("Name", doc["full_name"]), _row("Phone", doc["phone"]),
                        _row("Email", doc.get("email")), _row("Age", doc.get("age")), _row("Area", doc["area_of_concern"]),
                        _row("Mode", doc["preferred_mode"].replace("_", " ")), _row("Preferred date", doc.get("preferred_date")),
                        _row("Message", doc.get("message"))])
        eid = await send_email(to=os.environ["CLINIC_ALERT_EMAIL"], subject=f"New consultation request {reference}",
                         html=_wrap("New consultation request", rows, "Please contact the patient to confirm an appointment."),
                         reply_to=doc.get("email"))
        logger.warning(f"Consultation alert sent for {reference}: {eid}")
    except Exception as e:  # noqa: BLE001 — alerts must never break submissions
        logger.error(f"Consultation alert not sent for {reference}: {e}")


async def notify_referral(doc: dict, reference: str) -> None:
    try:
        files = len(doc.get("attachments", []))
        rows = "".join([_row("Reference", reference), _row("Urgency", doc["urgency"].upper()), _row("Category", doc["category"]),
                        _row("Patient", f'{doc["patient_name"]}' + (f', {doc["patient_age"]}' if doc.get("patient_age") is not None else "")),
                        _row("Referrer", f'{doc["referrer_name"]} {doc.get("referrer_qualification") or ""}'.strip()),
                        _row("Institution", doc["referrer_institution"]), _row("Phone", doc["referrer_phone"]),
                        _row("Email", doc["referrer_email"]), _row("Attachments", f"{files} file(s) — view in staff inbox" if files else None)])
        eid = await send_email(to=os.environ["CLINIC_ALERT_EMAIL"], subject=f"New {doc['urgency']} referral {reference}",
                         html=_wrap("New doctor referral", rows, "Clinical details and imaging are available only in the secure staff inbox."),
                         reply_to=doc["referrer_email"])
        logger.warning(f"Referral alert sent for {reference}: {eid}")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Referral alert not sent for {reference}: {e}")
