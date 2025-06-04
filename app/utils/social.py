import requests, logging
from fastapi import HTTPException
import os

def get_kakao_token(code: str):
    redirect_uri = os.getenv("KAKAO_REDIRECT_URI")
    print(f"🔍 실제 사용된 redirect_uri: {redirect_uri}")
    response = requests.post("https://kauth.kakao.com/oauth/token", data={
        "grant_type": "authorization_code",
        "client_id": os.getenv("KAKAO_CLIENT_ID"),
        "redirect_uri": os.getenv("KAKAO_REDIRECT_URI"),
        "code": code
    })
    return response.json()

def get_kakao_user_info(access_token: str) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.get("https://kapi.kakao.com/v2/user/me", headers=headers)
    data = resp.json()

    kakao_account = data.get("kakao_account", {})
    email = kakao_account.get("email")
    if not email:
        raise HTTPException(400, "이메일 제공에 동의하지 않았습니다.")

    profile = kakao_account.get("profile", {})
    nickname = profile.get("nickname")
    return {"email": email, "nickname": nickname}

def get_naver_token(code: str, state: str):
    response = requests.get("https://nid.naver.com/oauth2.0/token", params={
        "grant_type": "authorization_code",
        "client_id": os.getenv("NAVER_CLIENT_ID"),
        "client_secret": os.getenv("NAVER_CLIENT_SECRET"),
        "redirect_uri": os.getenv("NAVER_REDIRECT_URI"),
        "code": code,
        "state": state,
    })
    return response.json()

def get_naver_user_info(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get("https://openapi.naver.com/v1/nid/me", headers=headers)
    data = response.json()

    import logging
    logging.warning("🔍 네이버 응답: %s", data)  # 로그 찍기
    return data