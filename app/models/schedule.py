from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scheduler_id = Column(Integer, ForeignKey("schedulers.id"))  # 🔸 scheduler_id 추가
    title = Column(String(255), nullable=False)
    start = Column(DateTime, nullable=False)
    end = Column(DateTime, nullable=False)
    emotion = Column(String(255), default="")
    location = Column(String(255), default="")
    memo = Column(Text, default="")
    priority = Column(String(20), nullable=False, default="보통")
    tag = Column(String(50), default="")

    user = relationship("User", back_populates="schedules")
    scheduler = relationship("Scheduler", back_populates="schedules")  # 🔸 관계 설정

class Scheduler(Base):
    __tablename__ = "schedulers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    schedules = relationship("Schedule", back_populates="scheduler")  # 🔸 관계 설정