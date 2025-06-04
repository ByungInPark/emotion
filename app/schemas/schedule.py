from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# 📌 일정 등록용
class ScheduleCreate(BaseModel):
    title: str
    start: datetime
    end: datetime
    emotion: Optional[str] = ""
    location: Optional[str] = ""
    memo: Optional[str] = ""
    priority: Optional[str] = Field(default="보통") 
    tag: Optional[str] = ""
    scheduler_id: int

    class Config:
        from_attributes = True

# 📌 일정 수정용 (부분 수정 가능하도록 Optional 설정)
class ScheduleUpdate(BaseModel):
    title: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    emotion: Optional[str] = None
    location: Optional[str] = None
    memo: Optional[str] = None
    priority: Optional[str]
    tag: Optional[str] = ""
    scheduler_id: int

# 📌 일정 응답용
class ScheduleResponse(ScheduleCreate):
    id:       int
    title:    str
    start:    datetime
    end:      datetime
    emotion:  str
    location: str
    memo:     str
    priority: str
    tag: Optional[str] = ""
    scheduler_id: int

    class Config:
        from_attributes = True  # ✅ Pydantic v1 기준 (v2이면 from_attributes로 변경)
        # from_attributes = True  # ✅ Pydantic v2 사용하는 경우