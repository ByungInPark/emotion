
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.schedule import Scheduler, Schedule  # Schedule은 하위 일정 테이블
from app.schemas.scheduler import SchedulerCreate, SchedulerResponse
from app.schemas.schedule import ScheduleResponse  # 일정(Response) 스키마
from app.core.auth import get_current_user

scheduler_router = APIRouter(prefix="/api/schedulers", tags=["Schedulers"])

@scheduler_router.post(
    "/",
    response_model=SchedulerResponse,
)
def create_scheduler(
    payload: SchedulerCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_scheduler = Scheduler(
        name=payload.name,
        user_id=current_user.id
    )
    db.add(new_scheduler)
    db.commit()
    db.refresh(new_scheduler)
    return new_scheduler


@scheduler_router.get(
    "/",
    response_model=List[SchedulerResponse]
)
def get_my_schedulers(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 현재 사용자(user_id) 소유의 Scheduler만 조회
    return db.query(Scheduler).filter(Scheduler.user_id == current_user.id).all()


@scheduler_router.get(
    "/{scheduler_id}",
    response_model=SchedulerResponse
)
def get_scheduler(
    scheduler_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    scheduler = (
        db.query(Scheduler)
          .filter(Scheduler.id == scheduler_id, Scheduler.user_id == current_user.id)
          .first()
    )
    if not scheduler:
        raise HTTPException(status_code=404, detail="스케줄러를 찾을 수 없습니다.")
    return scheduler


@scheduler_router.delete(
    "/{scheduler_id}"
)
def delete_scheduler(
    scheduler_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    scheduler = (
        db.query(Scheduler)
          .filter(Scheduler.id == scheduler_id, Scheduler.user_id == current_user.id)
          .first()
    )
    if not scheduler:
        raise HTTPException(status_code=404, detail="스케줄러를 찾을 수 없습니다.")
    db.delete(scheduler)
    db.commit()
    return {"message": "삭제 완료"}


@scheduler_router.get(
    "/{scheduler_id}/schedules",
    response_model=List[ScheduleResponse]
)
def get_schedules_by_scheduler(
    scheduler_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1) 해당 스케줄러가 현재 유저에게 속하는지 확인
    scheduler = (
        db.query(Scheduler)
          .filter(Scheduler.id == scheduler_id, Scheduler.user_id == current_user.id)
          .first()
    )
    if not scheduler:
        raise HTTPException(status_code=404, detail="스케줄러를 찾을 수 없습니다.")

    # 2) 스케줄러가 소유한 Schedule(일정) 리스트를 반환
    #    (ScheduleResponse: ScheduleCreate + id 를 포함한 스키마)
    return scheduler.schedules