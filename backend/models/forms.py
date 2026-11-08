import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

Status = Literal["new", "reviewed", "scheduled", "closed"]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uid() -> str:
    return str(uuid.uuid4())


class ConsultationCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=6, max_length=30)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(default=None, ge=0, le=120)
    area_of_concern: str = Field(min_length=2, max_length=80)
    preferred_mode: Literal["in_person", "video", "either"] = "in_person"
    preferred_date: Optional[str] = Field(default=None, max_length=20)
    message: str = Field(default="", max_length=3000)
    consent: bool

    @field_validator("consent")
    @classmethod
    def must_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Consent is required")
        return v


class Consultation(ConsultationCreate):
    id: str = Field(default_factory=_uid)
    created_at: datetime = Field(default_factory=_now)
    status: Status = "new"


class ReferralCreate(BaseModel):
    referrer_name: str = Field(min_length=2, max_length=120)
    referrer_qualification: str = Field(default="", max_length=120)
    referrer_institution: str = Field(min_length=2, max_length=160)
    referrer_phone: str = Field(min_length=6, max_length=30)
    referrer_email: EmailStr
    patient_name: str = Field(min_length=2, max_length=120)
    patient_age: Optional[int] = Field(default=None, ge=0, le=120)
    patient_sex: Literal["female", "male", "other", "unspecified"] = "unspecified"
    category: str = Field(min_length=2, max_length=80)
    urgency: Literal["routine", "soon", "urgent"] = "routine"
    clinical_summary: str = Field(min_length=10, max_length=5000)
    imaging_summary: str = Field(default="", max_length=3000)
    question: str = Field(default="", max_length=2000)
    consent: bool

    @field_validator("consent")
    @classmethod
    def must_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Consent is required")
        return v


class Attachment(BaseModel):
    id: str = Field(default_factory=_uid)
    filename: str
    content_type: str
    size: int


class Referral(ReferralCreate):
    id: str = Field(default_factory=_uid)
    created_at: datetime = Field(default_factory=_now)
    status: Status = "new"
    attachments: list[Attachment] = []


class SubmissionReceipt(BaseModel):
    id: str
    reference: str


class StatusUpdate(BaseModel):
    status: Status


class AdminLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class AdminMe(BaseModel):
    email: str


class InboxCounts(BaseModel):
    consultations_new: int
    referrals_new: int
