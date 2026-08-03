import json
import asyncio

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse

from ..agent import generate_reading, generate_reading_stream, generate_all_readings
from ..agent.reading_agent import moderate_with_llm, validate_question_with_llm
from ..security import check_rate_limit, sanitize_response, security_logger
from ..schemas.agent import AgentReadingRequest, ValidateQuestionRequest

router = APIRouter(prefix="/api/agent", tags=["agent"])


# ── 辅助函数 ──────────────────────────────────────────────────────────────────

def _enforce_rate_limit(request: Request) -> None:
    """检查速率限制，超限则抛出 429。"""
    client_ip = request.client.host if request.client else "unknown"
    allowed, msg = check_rate_limit(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=msg)


async def _moderated_event_stream(request: Request, req: AgentReadingRequest, card_dicts: list[dict]):
    """
    带并行审核的 SSE 流式生成器。
    审核与生成同时启动，审核失败时中断流。
    """
    moderation_failed = asyncio.Event()
    moderation_result = {"safe": True, "reason": ""}

    async def run_moderation():
        try:
            is_safe, reason = await moderate_with_llm(req.question)
            if not is_safe:
                moderation_result["safe"] = False
                moderation_result["reason"] = reason
                moderation_failed.set()
                security_logger.warning(f"Parallel moderation blocked: {reason}")
        except Exception as e:
            security_logger.error(f"Parallel moderation error: {e}")

    moderation_task = asyncio.create_task(run_moderation())

    try:
        async for chunk in generate_reading_stream(
            req.question, card_dicts, req.total_cards, req.current_index, req.is_combined
        ):
            if moderation_failed.is_set():
                yield f"data: {json.dumps({'error': '内容不安全，已中断'})}\n\n"
                yield "data: [DONE]\n\n"
                return

            safe_chunk = sanitize_response(chunk)
            yield f"data: {json.dumps({'text': safe_chunk})}\n\n"

        # 等待审核完成
        if not moderation_task.done():
            try:
                await asyncio.wait_for(moderation_task, timeout=2.0)
            except asyncio.TimeoutError:
                pass

        if moderation_failed.is_set():
            yield f"data: {json.dumps({'error': '内容不安全，已中断'})}\n\n"

        yield "data: [DONE]\n\n"
    except Exception:
        yield f"data: {json.dumps({'error': '生成失败'})}\n\n"
        yield "data: [DONE]\n\n"


# ── 端点 ──────────────────────────────────────────────────────────────────────

@router.post("/validate-question")
async def validate_question_endpoint(req: ValidateQuestionRequest, request: Request):
    """验证问题是否值得占卜"""
    _enforce_rate_limit(request)

    is_valid, message = await validate_question_with_llm(req.question)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message or "请想清楚后再问")
    return {"valid": True}


@router.post("/reading")
async def agent_reading(req: AgentReadingRequest, request: Request):
    """一次性生成解读"""
    _enforce_rate_limit(request)

    is_safe, reason = await moderate_with_llm(req.question)
    if not is_safe:
        raise HTTPException(status_code=400, detail=f"输入内容不安全: {reason}")

    card_dicts = [c.model_dump() for c in req.cards]
    result = await generate_reading(req.question, card_dicts)
    return {"reading": sanitize_response(result)}


@router.post("/reading/stream")
async def agent_reading_stream(req: AgentReadingRequest, request: Request):
    """流式生成解读（SSE）- 并行审核，零延迟"""
    _enforce_rate_limit(request)

    # 第一张牌时验证问题有效性
    if req.current_index == 0:
        is_valid, message = await validate_question_with_llm(req.question)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message or "请想清楚后再问")

    card_dicts = [c.model_dump() for c in req.cards]

    return StreamingResponse(
        _moderated_event_stream(request, req, card_dicts),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.post("/reading/batch")
async def agent_reading_batch(req: AgentReadingRequest, request: Request):
    """批量生成：一次返回所有牌的解读（用于动画期间预取）"""
    _enforce_rate_limit(request)

    # 并行审核 + 生成
    moderation_task = asyncio.create_task(moderate_with_llm(req.question))
    card_dicts = [c.model_dump() for c in req.cards]

    try:
        readings = await generate_all_readings(req.question, card_dicts)
    except Exception as e:
        security_logger.error(f"Batch reading error: {e}")
        raise HTTPException(status_code=500, detail="解读生成失败")

    # 等审核结果
    try:
        is_safe, reason = await asyncio.wait_for(moderation_task, timeout=5.0)
        if not is_safe:
            raise HTTPException(status_code=400, detail=f"输入内容不安全: {reason}")
    except asyncio.TimeoutError:
        security_logger.warning("Batch moderation timeout, allowing")

    return {"readings": [sanitize_response(r) for r in readings]}
