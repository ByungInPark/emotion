from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str        # 사용자 닉네임
    email: EmailStr      # 로그인용 이메일
    password: str
    name: str            # 실제 이름
    birth: str
    recovery_email: EmailStr 

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    name: str
    birth: str

    class Config:
        from_attributes = True  # ← SQLAlchemy 객체 자동 변환 지원
        
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    name: Optional[str] = None
    birth: Optional[str] = None
    password: Optional[str] = None 