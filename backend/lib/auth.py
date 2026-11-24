"""Single-admin auth: credentials from .env, session as an httpOnly JWT cookie."""

import hmac
import os
import time
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, Request, Response

COOKIE = "dvir_admin"
ALGO = "HS256"
TTL_HOURS = 12
_failures: dict[str, list[float]] = {}


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def check_rate(ip: str) -> None:
    now = time.time()
    recent = [t for t in _failures.get(ip, []) if now - t < 900]
    _failures[ip] = recent
    if len(recent) >= 8:
        raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")


def record_failure(ip: str) -> None:
    _failures.setdefault(ip, []).append(time.time())


def verify_credentials(email: str, password: str) -> bool:
    ok_email = hmac.compare_digest(email.strip().lower(), os.environ["ADMIN_EMAIL"].lower())
    ok_pw = hmac.compare_digest(password, os.environ["ADMIN_PASSWORD"])
    return ok_email and ok_pw


def set_session(response: Response, email: str) -> None:
    exp = datetime.now(timezone.utc) + timedelta(hours=TTL_HOURS)
    token = jwt.encode({"sub": email, "exp": exp, "role": "admin"}, _secret(), algorithm=ALGO)
    response.set_cookie(COOKIE, token, httponly=True, secure=True, samesite="lax",
                        max_age=TTL_HOURS * 3600, path="/")


def clear_session(response: Response) -> None:
    response.delete_cookie(COOKIE, path="/")


def _decode_session(token: str) -> dict:
    try:
        return jwt.decode(token, _secret(), algorithms=[ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Session expired")


def require_admin(request: Request) -> str:
    token = request.cookies.get(COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    data = _decode_session(token)
    if data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return data["sub"]
