from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.social import (
    get_kakao_token, get_kakao_user_info,
    get_naver_token, get_naver_user_info
)
from app.database import get_db
from app.models.user import User
from app.utils.jwt_handler import create_access_token

router = APIRouter(tags=["OAuth"])

@router.get("/kakao/callback")
def kakao_callback(code: str, db: Session = Depends(get_db)):
    token_data = get_kakao_token(code)
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="카카오 토큰 발급 실패")

    user_info = get_kakao_user_info(access_token)
    kakao_id = user_info.get("id")
    email = user_info.get("kakao_account", {}).get("email")

    if not email:
        raise HTTPException(status_code=400, detail="카카오 이메일 수집 실패")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # 최초 로그인 시 유저 생성
        user = User(
            email=email,
            username=f"kakao_{kakao_id}",
            name="카카오유저",
            hashed_password="oauth_kakao",  # 실제 비밀번호 없이 마킹
            recovery_email=email
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/naver/callback")
def naver_callback(code: str, state: str, db: Session = Depends(get_db)):
    token_data = get_naver_token(code, state)
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="네이버 토큰 발급 실패")

    user_info = get_naver_user_info(access_token)
    naver_data = user_info.get("response", {})
    email = naver_data.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="네이버 이메일 없음")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            username=f"naver_{naver_data.get('id')}",
            name=naver_data.get("name", "네이버유저"),
            hashed_password="oauth_naver",
            recovery_email=email
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}