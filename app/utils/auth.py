from passlib.context import CryptContext

# 해시 알고리즘 설정 (bcrypt 사용)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 비밀번호를 해시로 변환
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# 비밀번호 비교 (로그인 시 사용)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)