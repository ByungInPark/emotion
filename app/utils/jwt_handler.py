from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError, ExpiredSignatureError
import os

# ✅ .env에서 값 불러오기 (기본값 포함)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_super_secret_key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 60))

# ✅ 토큰 생성
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ✅ 토큰 디코딩 및 검증
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("🔍 디코딩 성공:", payload)
        return payload
    except ExpiredSignatureError:
        print("❌ 만료된 토큰입니다.")
    except JWTError:
        print("❌ 유효하지 않은 토큰입니다.")
    return None