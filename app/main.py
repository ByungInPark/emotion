import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import logging

from app.database import engine, Base
from app.routers.oauth import router as oauth_router
from app.routers.user import router as user_router
from app.routers.scheduler import scheduler_router
from app.routers.schedule import router as schedule_router
from app.routers.ai_router import router as ai_router  # APIRouter

# 1. 환경변수 로드
load_dotenv()
logging.basicConfig(level=logging.INFO)
logging.info("▶ OPENAI_API_KEY=" + os.getenv("OPENAI_API_KEY", "<없음>"))

# 2. FastAPI 앱 생성
app = FastAPI()

# 3. CORS 설정 (개발 중 편하게 모두 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. 라우터 등록
app.include_router(
    oauth_router,
    prefix="/auth",        # /auth/kakao/callback, /auth/naver/callback 등
    tags=["OAuth"]
)
app.include_router(
    user_router,
    prefix="/api/users",   # /api/users/…
    tags=["Users"]
)
app.include_router(
    scheduler_router,  # /api/schedulers/…
    tags=["Schedulers"]
)
app.include_router(
    schedule_router,
    prefix="/api/schedule",   # /api/schedules/…
    tags=["Schedules"]
)
app.include_router(
    ai_router,             # 이미 APIRouter이므로 .router가 필요 없습니다.
    prefix="/api/ai",      # /api/ai/plan, /api/ai/location-plan 등
    tags=["AI"]
)

@app.get("/ping")
def ping():
    return {"msg": "pong"}

# 5. DB 테이블 생성
Base.metadata.create_all(bind=engine)

# 6. SPA 진입점 (index.html) 템플릿
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# 7. OpenAPI 커스터마이징 (모든 경로에 BearerAuth 적용)
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version="1.0.0",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"bearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# 8. 등록된 라우트 로그 출력
logging.info("🔍 Registered routes:")
for route in app.router.routes:
    logging.info(f"  {route.methods}  → {route.path}")