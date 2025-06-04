from sqlalchemy.orm import Session
from app import models, schemas

def create_schedule(db: Session, user_id: int, schedule_data: schemas.ScheduleCreate):
    schedule = models.schedule.Schedule(**schedule_data.dict(), user_id=user_id)
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule