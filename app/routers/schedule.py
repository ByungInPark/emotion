from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.schedule import Schedule
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate, ScheduleResponse
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(
    tags=["Schedules"]
)

@router.post(
    "/",
    response_model=ScheduleResponse,
    status_code=status.HTTP_201_CREATED
)
def create_schedule(
    payload: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # user_id와 scheduler_id를 포함해서 DB에 저장
    new = Schedule(**payload.dict(), user_id=current_user.id)
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@router.get("/health")
def health_check():
    return {"status": "Schedules router OK"}

@router.get(
    "",
    response_model=List[ScheduleResponse],
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "사용자의 전체 일정 조회 성공"},
        401: {"description": "토큰이 없거나 유효하지 않음"},
        404: {"description": "일정이 없습니다."},
    },
)
def get_schedules(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    scheduler_id: int = None  # 쿼리 파라미터로 받아올 수도 있음
):
    query = db.query(Schedule).filter(Schedule.user_id == current_user.id)
    if scheduler_id:
        query = query.filter(Schedule.scheduler_id == scheduler_id)
    return query.all()


@router.post(
    "",
    response_model=ScheduleResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "일정 생성 성공"},
        400: {"description": "잘못된 요청 데이터"},
        401: {"description": "토큰이 없거나 유효하지 않음"},
    },
)
def create_schedule(
    schedule: ScheduleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    new_schedule = Schedule(**schedule.dict(), user_id=user.id)
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return new_schedule


@router.put(
    "/{schedule_id}",
    response_model=ScheduleResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "일정 수정 성공"},
        400: {"description": "잘못된 요청 데이터"},
        401: {"description": "토큰이 없거나 유효하지 않음"},
        404: {"description": "해당 일정이 존재하지 않음"},
    },
)
def update_schedule(
    schedule_id: int,
    updated: ScheduleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    sched = (
        db.query(Schedule)
        .filter(Schedule.id == schedule_id, Schedule.user_id == current_user.id)
        .first()
    )
    if not sched:
        raise HTTPException(status_code=404, detail="해당 일정이 없습니다.")
    for k, v in updated.dict(exclude_unset=True).items():
        setattr(sched, k, v)
    db.commit()
    db.refresh(sched)
    return sched

@router.delete(
    "/{schedule_id}",
    status_code=status.HTTP_200_OK
)
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    sched = (
        db.query(Schedule)
        .filter(Schedule.id == schedule_id, Schedule.user_id == current_user.id)
        .first()
    )
    if not sched:
        raise HTTPException(status_code=404, detail="해당 일정이 없습니다.")
    db.delete(sched)
    db.commit()
    return {"message": "삭제 완료"}