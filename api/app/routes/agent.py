import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..agent import generate_reading, generate_reading_stream

router = APIRouter(prefix="/api/agent", tags=["agent"])


class AgentCardRequest(BaseModel):
    card_id: int
    card_name: str
    card_en: str
    reversed: bool
    position: str | None = None
    reading_text: str = ""


class AgentReadingRequest(BaseModel):
    question: str
    cards: list[AgentCardRequest]
    total_cards: int = 1       # 总共要抽几张
    current_index: int = 0     # 当前是第几张（0-based）
    is_combined: bool = False  # 是否是综合解读


@router.post("/reading")
async def agent_reading(req: AgentReadingRequest):
    """一次性生成解读"""
    card_dicts = [c.model_dump() for c in req.cards]
    result = await generate_reading(req.question, card_dicts)
    return {"reading": result}


@router.post("/reading/stream")
async def agent_reading_stream(req: AgentReadingRequest):
    """流式生成解读（SSE）"""
    card_dicts = [c.model_dump() for c in req.cards]

    async def event_generator():
        async for chunk in generate_reading_stream(
            req.question, card_dicts, req.total_cards, req.current_index, req.is_combined
        ):
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
