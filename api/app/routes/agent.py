import json
import asyncio

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator

from ..agent import generate_reading, generate_reading_stream
from ..agent.reading_agent import moderate_with_llm
from ..security import validate_question, validate_card_data, sanitize_input, check_rate_limit, sanitize_response, security_logger

router = APIRouter(prefix="/api/agent", tags=["agent"])


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
        # 清洗
        cleaned = sanitize_input(v)
        # 验证
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


@router.post("/reading")
async def agent_reading(req: AgentReadingRequest, request: Request):
    """一次性生成解读"""
    # 速率限制
    client_ip = request.client.host if request.client else "unknown"
    allowed, msg = check_rate_limit(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=msg)

    # LLM 输入审核
    is_safe, reason = await moderate_with_llm(req.question)
    if not is_safe:
        raise HTTPException(status_code=400, detail=f"输入内容不安全: {reason}")

    card_dicts = [c.model_dump() for c in req.cards]
    result = await generate_reading(req.question, card_dicts)
    return {"reading": sanitize_response(result)}


@router.post("/reading/stream")
async def agent_reading_stream(req: AgentReadingRequest, request: Request):
    """流式生成解读（SSE）- 并行审核，零延迟"""
    # 速率限制（必须同步通过）
    client_ip = request.client.host if request.client else "unknown"
    allowed, msg = check_rate_limit(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=msg)

    card_dicts = [c.model_dump() for c in req.cards]

    # 并行审核状态
    moderation_failed = asyncio.Event()
    moderation_result = {"safe": True, "reason": ""}

    async def run_moderation():
        """后台审核任务"""
        try:
            is_safe, reason = await moderate_with_llm(req.question)
            if not is_safe:
                moderation_result["safe"] = False
                moderation_result["reason"] = reason
                moderation_failed.set()
                security_logger.warning(f"Parallel moderation blocked: {reason}")
        except Exception as e:
            # 审核失败不阻断
            security_logger.error(f"Parallel moderation error: {e}")

    # 启动后台审核（不等待结果）
    moderation_task = asyncio.create_task(run_moderation())

    async def event_generator():
        try:
            async for chunk in generate_reading_stream(
                req.question, card_dicts, req.total_cards, req.current_index, req.is_combined
            ):
                # 检查审核是否已失败
                if moderation_failed.is_set():
                    yield f"data: {json.dumps({'error': '内容不安全，已中断'})}\n\n"
                    yield "data: [DONE]\n\n"
                    return

                # 清洗响应内容，防止 XSS
                safe_chunk = sanitize_response(chunk)
                yield f"data: {json.dumps({'text': safe_chunk})}\n\n"

            # 等审核完成（如果还没完成的话）
            if not moderation_task.done():
                try:
                    await asyncio.wait_for(moderation_task, timeout=2.0)
                except asyncio.TimeoutError:
                    pass

            # 最后检查一次
            if moderation_failed.is_set():
                yield f"data: {json.dumps({'error': '内容不安全，已中断'})}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': '生成失败'})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
