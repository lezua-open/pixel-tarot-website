from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Reading, ReadingCard
from ..schemas import SaveReadingRequest, ReadingResponse, ReadingListResponse

router = APIRouter(prefix="/api/readings", tags=["readings"])


@router.post("", response_model=ReadingResponse)
def save_reading(req: SaveReadingRequest, db: Session = Depends(get_db)):
    """保存占卜记录"""
    reading = Reading(
        question=req.question,
        draw_count=req.draw_count,
        combined_reading=req.combined_reading,
    )
    for card in req.cards:
        reading.cards.append(ReadingCard(
            card_id=card.card_id,
            card_name=card.card_name,
            card_en=card.card_en,
            reversed=card.reversed,
            position=card.position,
            reading_text=card.reading_text,
        ))

    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


@router.get("", response_model=ReadingListResponse)
def list_readings(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """获取占卜记录列表"""
    total = db.query(Reading).count()
    readings = (
        db.query(Reading)
        .order_by(Reading.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return ReadingListResponse(data=readings, total=total)


@router.get("/{reading_id}", response_model=ReadingResponse)
def get_reading(reading_id: str, db: Session = Depends(get_db)):
    """获取单条占卜记录"""
    reading = db.query(Reading).filter(Reading.id == reading_id).first()
    if not reading:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="记录不存在")
    return reading


@router.delete("/{reading_id}")
def delete_reading(reading_id: str, db: Session = Depends(get_db)):
    """删除占卜记录"""
    reading = db.query(Reading).filter(Reading.id == reading_id).first()
    if not reading:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="记录不存在")
    db.delete(reading)
    db.commit()
    return {"success": True}
