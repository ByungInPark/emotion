from pydantic import BaseModel, Field

class LocationPlanRequest(BaseModel):
    latitude: float = Field(..., description="선택된 장소 위도")
    longitude: float = Field(..., description="선택된 장소 경도")
    theme: str = Field(..., description="일정을 생성할 테마 (예: '카페 투어')")

    class Config:
        schema_extra = {
            "example": {
                "latitude": 37.5700,
                "longitude": 126.9830,
                "theme": "카페 투어"
            }
        }