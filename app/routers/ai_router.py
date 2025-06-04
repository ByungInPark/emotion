from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List
from app.services.ai_service import generate_plan, generate_location_plan

router = APIRouter(tags=["AI"])

class PlanRequest(BaseModel):
    start_date: str
    end_date: str
    emotion_focus: str
    activity_types: List[str]
    required_keywords: List[str]
    user_id: int

class PlanResponse(BaseModel):
    plan: str

@router.post("/plan", response_model=PlanResponse, status_code=status.HTTP_200_OK)
def create_ai_plan(req: PlanRequest):
    try:
        # v2에서는 req.model_dump() 사용
        data = req.model_dump()
        plan_text = generate_plan(data)
        return {"plan": plan_text}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 플랜 생성 중 오류: {e}"
        )


class LocationPlanRequest(BaseModel):
    latitude: float
    longitude: float
    theme: str
    user_id: int

class LocationPlanResponse(BaseModel):
    plan: str

@router.post("/location-plan", response_model=LocationPlanResponse, status_code=status.HTTP_200_OK)
def create_location_plan(req: LocationPlanRequest):
    try:
        # v2에서는 req.model_dump() 사용
        data = req.model_dump()
        plan_text = generate_location_plan(data)
        return {"plan": plan_text}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"위치 기반 AI 일정 생성 중 오류: {e}"
        )