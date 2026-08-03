"""Agent 路由的请求 Schema"""

from pydantic import BaseModel, field_validator

from ..security import sanitize_input, validate_question


class AgentCardRequest(BaseModel):
    card_id: int
    card_name: str
    card_en: str
    reversed: bool
    position: str | None = None
    reading_text: str = ""

    @field_validator("card_name", "card_en")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        return sanitize_input(v)

    @field_validator("card_id")
    @classmethod
    def validate_card_id(cls, v: int) -> int:
        if not (0 <= v <= 21):
            raise ValueError("无效的牌面 ID")
        return v


class AgentReadingRequest(BaseModel):
    question: str
    cards: list[AgentCardRequest]
    total_cards: int = 1
    current_index: int = 0
    is_combined: bool = False

    @field_validator("question")
    @classmethod
    def validate_and_sanitize_question(cls, v: str) -> str:
        cleaned = sanitize_input(v)
        is_valid, error_msg = validate_question(cleaned)
        if not is_valid:
            raise ValueError(error_msg)
        return cleaned

    @field_validator("total_cards")
    @classmethod
    def validate_total_cards(cls, v: int) -> int:
        if v not in (1, 2, 3):
            raise ValueError("total_cards 必须是 1、2 或 3")
        return v

    @field_validator("cards")
    @classmethod
    def validate_cards(cls, v: list) -> list:
        if len(v) == 0:
            raise ValueError("至少需要一张牌")
        if len(v) > 3:
            raise ValueError("最多三张牌")
        return v


class ValidateQuestionRequest(BaseModel):
    question: str
