from datetime import datetime
from pydantic import BaseModel


class CardReadingSchema(BaseModel):
    card_id: int
    card_name: str
    card_en: str
    reversed: bool
    position: str | None = None
    reading_text: str


class SaveReadingRequest(BaseModel):
    question: str
    draw_count: int = 1
    cards: list[CardReadingSchema]
    combined_reading: str | None = None


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
