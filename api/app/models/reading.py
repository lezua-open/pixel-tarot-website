import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Reading(Base):
    """占卜记录主表"""
    __tablename__ = "readings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question: Mapped[str] = mapped_column(Text, nullable=False)
    draw_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    combined_reading: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cards: Mapped[list["ReadingCard"]] = relationship(back_populates="reading", cascade="all, delete-orphan")


class ReadingCard(Base):
    """占卜记录-牌面详情"""
    __tablename__ = "reading_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    reading_id: Mapped[str] = mapped_column(String(36), ForeignKey("readings.id"), nullable=False)
    card_id: Mapped[int] = mapped_column(Integer, nullable=False)
    card_name: Mapped[str] = mapped_column(String(50), nullable=False)
    card_en: Mapped[str] = mapped_column(String(50), nullable=False)
    reversed: Mapped[bool] = mapped_column(Boolean, default=False)
    position: Mapped[str | None] = mapped_column(String(20), nullable=True)  # past/present/future
    reading_text: Mapped[str] = mapped_column(Text, nullable=False)

    reading: Mapped["Reading"] = relationship(back_populates="cards")
