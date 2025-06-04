from pydantic import BaseModel
from typing import Optional

class SchedulerCreate(BaseModel):
    name: str

    class Config:
        from_attributes = True

class SchedulerResponse(BaseModel):
    id: int
    name: str
    user_id: int

    class Config:
        from_attributes = True