from pydantic import BaseModel, Field


class PatientContent(BaseModel):
    title: str = Field(max_length=200)
    summary: str = Field(max_length=400)
    patient: str = Field(max_length=2000)
    steps: list[str] = Field(min_length=6, max_length=6)
    indications: list[str] = Field(max_length=8)
    risks: list[str] = Field(max_length=10)
    alternatives: list[str] = Field(max_length=8)


class TranslationOut(BaseModel):
    slug: str
    lang: str
    cached: bool
    content: PatientContent
