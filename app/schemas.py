from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ScheduleCreate(BaseModel):
    title: str
    start: datetime
    end: datetime
    emotion: Optional[str] = ""
    location: Optional[str] = ""
    memo: Optional[str] = ""

class ScheduleOut(ScheduleCreate):
    id: int
    class Config:
        orm_mode = True