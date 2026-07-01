from datetime import datetime
from pydantic import BaseModel, field_validator

from ..security import sanitize_input, validate_question


class CardReadingSchema(BaseModel):
    card_id: int
    card_name: str
    card_en: str
    reversed: bool
    position: str | None = None
    reading_text: str

    @field_validator("card_name", "card_en", "reading_text")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        return sanitize_input(v)

    @field_validator("card_id")
    @classmethod
    def validate_card_id(cls, v: int) -> int:
        if not (0 <= v <= 21):
            raise ValueError("无效的牌面 ID")
        return v


class SaveReadingRequest(BaseModel):
    question: str
    draw_count: int = 1
    cards: list[CardReadingSchema]
    combined_reading: str | None = None

    @field_validator("question")
    @classmethod
    def validate_and_sanitize_question(cls, v: str) -> str:
        cleaned = sanitize_input(v)
        is_valid, error_msg = validate_question(cleaned)
        if not is_valid:
            raise ValueError(error_msg)
        return cleaned

    @field_validator("draw_count")
    @classmethod
    def validate_draw_count(cls, v: int) -> int:
        if v not in (1, 2, 3):
            raise ValueError("draw_count 必须是 1、2 或 3")
        return v

    @field_validator("combined_reading")
    @classmethod
    def sanitize_combined_reading(cls, v: str | None) -> str | None:
        if v is not None:
            return sanitize_input(v)
        return v


class ReadingCardResponse(BaseModel):
    card_id: int
    card_name: str
    card_en: str
    reversed: bool
    position: str | None
    reading_text: str

    class Config:
        from_attributes = True


class ReadingResponse(BaseModel):
    id: str
    question: str
    draw_count: int
    combined_reading: str | None
    cards: list[ReadingCardResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReadingListResponse(BaseModel):
    success: bool = True
    data: list[ReadingResponse]
    total: int
