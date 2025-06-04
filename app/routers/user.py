from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.utils.hashing import get_password_hash, verify_password
from app.utils.jwt_handler import create_access_token
from app.database import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.utils.auth import get_password_hash
from app.schemas.user import UserLogin, UserUpdate # 추가
from fastapi.responses import RedirectResponse
from app.utils.social import get_kakao_token, get_kakao_user_info 
from app.utils.social import get_naver_token, get_naver_user_info 
from app.schemas.user import UserResponse
from app.utils.hashing import get_password_hash

router = APIRouter(
    tags=["Users"]
)

@router.get("/debug/user")
def debug_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_user_me(update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_data = update.dict(exclude_unset=True)

    # ✅ 비밀번호가 들어왔다면 해시 처리
    if "password" in update_data:
        current_user.hashed_password = get_password_hash(update_data.pop("password"))

    # ✅ 나머지 필드 업데이트
    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # 이메일 중복 확인
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")
    
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

    hashed_pw = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_pw,
        username=user.username,
        name=user.name,
        birth=user.birth,
        recovery_email=user.recovery_email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "회원가입 성공"}

@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

# ✅ 현재 로그인된 사용자 정보 확인
@router.get("/me")
def read_my_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "name": current_user.name,
        "birth": current_user.birth
    }

@router.delete("/me", summary="회원 탈퇴")
def delete_my_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return {"message": "회원 탈퇴 완료"}

@router.post("/kakao/callback")
def kakao_callback(data: dict = Body(...), db: Session = Depends(get_db)):
    code = data.get("code")
    token_response = get_kakao_token(code)
    access_token = token_response.get("access_token")
    user_info = get_kakao_user_info(access_token)

    email = user_info["email"]
    nickname = user_info["nickname"]

    user = db.query(User).filter(User.email == email).first()
    if not user:
        try:
            user = User(
                email=email,
                username=nickname,
                hashed_password="social",
                recovery_email=email
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"회원 생성 중 오류 발생: {e}")

    jwt_token = create_access_token({"sub": email})
    return {"access_token": jwt_token}

@router.post("/naver/callback")
def naver_callback(code: str, state: str, db: Session = Depends(get_db)):
    token_data = get_naver_token(code, state)
    access_token = token_data.get("access_token")
    user_info = get_naver_user_info(access_token)

    response = user_info.get("response", {})
    email = response.get("email")
    nickname = response.get("nickname") or "네이버유저"
    name = response.get("name") or "네이버이름"

    if not email:
        raise HTTPException(status_code=400, detail="이메일을 제공받지 못했습니다.")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            email=email,
            username=nickname,
            name=name,
            hashed_password="social",
            recovery_email=email
        )
        db.add(user)
    else:
        # 기존 유저일 경우에도 이름/닉네임 최신화
        user.username = nickname
        user.name = name

    db.commit()
    db.refresh(user)

    jwt_token = create_access_token({"sub": email})
    return {"access_token": jwt_token}