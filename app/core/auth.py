import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

# .env에서 로드할 환경변수 이름은 .env에 반드시 설정해주세요
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_secret_key")
ALGORITHM  = os.getenv("JWT_ALGORITHM",    "HS256")

bearer_scheme = HTTPBearer()

def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db:    Session                      = Depends(get_db),
) -> User:
    token = creds.credentials  # HTTPBearer 가 "Bearer " 접두어를 제거해 줍니다

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"🔍 payload:", payload)
        email = payload.get("sub")
        print(f"📩 찾은 이메일:", email)
    except JWTError as e:
        print("❌ 디코딩 실패:", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        print("❌ 해당 이메일 유저가 DB에 없음!")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user