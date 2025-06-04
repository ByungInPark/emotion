from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    recovery_email = Column(String(255), nullable=True)
    name = Column(String(100), nullable=True)
    birth = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    schedules = relationship("Schedule", back_populates="user", cascade="all, delete")