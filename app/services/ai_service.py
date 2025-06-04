import os
from openai import OpenAI          # OpenAI Python v1.x 인터페이스 사용
from typing import Dict
from dotenv import load_dotenv
import logging

# .env 로드 후, 클라이언트 초기화
# main.py 에서 load_dotenv() 이미 호출됨
load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    logging.error("OPENAI_API_KEY가 설정되지 않았습니다.")

# OpenAI 클라이언트 생성 (v1.x 인터페이스 가정)
client = OpenAI(api_key=API_KEY)

def generate_plan(request_data: Dict) -> str:
    """
    기존 ‘감정 중심 AI 플랜’ 생성 함수
    request_data 예시:
        {
            "user_id": 1,
            "start_date": "2025-06-01",
            "end_date": "2025-06-02",
            "emotion_focus": "행복",
            "activity_types": ["카페", "산책"],
            "required_keywords": ["야외", "자연"]
        }
    """
    keyword_text = ", ".join(request_data.get("required_keywords", [])) or "없음"

    prompt = f"""
사용자 ID: {request_data['user_id']}
기간: {request_data['start_date']} ~ {request_data['end_date']}
목표 감정: {request_data['emotion_focus']}
선호 활동: {', '.join(request_data['activity_types'])}
필수 키워드: {keyword_text}

요청된 활동(activity_types), 필수 키워드(keyword_text)를 다음 규칙에 맞춰 세부적으로 계획하세요:

0) **활동 유형에 따른 가변적 일정 구성**:
   - 활동에 따라 일정 아이템 수를 자유롭게 생성하세요. 최소 1개, 최대 제한 없이 활동에 맞게 제안합니다.

1) **데이트/여행**처럼 장소 이동 동선이 중요한 활동:
   - **여행 코스**: 이동 순서 및 교통수단(도보, 대중교통, 차량 등)
   - **장소별 체류 시간** 및 **구체적 활동 내용**
   - **지도 상의 권장 경로** 및 **이동 거리/시간** 안내
   - GFM Markdown 테이블로 제시

2) **무산소 운동** 등 **순서가 중요한 활동**:
   - **운동 순서**: 워밍업, 메인 루틴, 쿨다운 순으로
   - 각 세트별 **반복 횟수/세트 수** 및 **휴식 시간** 포함
   - **운동 동작별 주의사항** 및 **팁**
   - Markdown 리스트 또는 테이블 형식으로 작성

3) **단시간(1시간 이내)** 활동:
   - GFM Markdown 테이블
   - 헤더: 날짜 | 시작-종료 시간 | 활동 | 예상 소요 시간
   - 반드시 구분선(---) 포함

4) **2시간 이상** 활동:
   - 하나의 연속 블록으로 작성
   - 표 동일한 형식(날짜 | 시작-종료 | 활동 | 예상 시간)

5) **표 아래**에 **부연 설명 & 팁** 섹션을 추가
6) **필수 키워드**를 활동명과 코스/위치에 반드시 포함
7) **표와 부연 설명의 예상 소요 시간**이 일치하도록 작성
8) 화면에 지도가 보일 시 위치 반경 내에서 하루 일정(오전 10시부터 오후 6시까지)을 다음 형식의 Markdown 표로 작성해 주세요.
각 행에는 시간(예: 10:00-11:00), 장소명, 추천 활동, 이동 소요 시간(분)을 포함해 주세요.

---

# 예시 (데이트 + 러닝 + 자격증공부)
| 날짜       | 시간        | 활동                                      | 예상 소요 시간 |
|-----------|--------------|------------------------------------------|---------------|
| 2025-06-01 | 10:00-11:00   | 한강 카페 데이트 (한강뷰 카페; 필수 키워드: 한강) | 1시간         |
| 2025-06-01 | 11:15-12:15   | 공원 산책 (한강공원 도보 순환로)             | 1시간         |
| 2025-06-01 | 18:00-20:00   | 자전거 러닝 (한강 자전거 도로)               | 2시간         |

**무산소 운동 루틴**
1. 워밍업: 가벼운 스트레칭 (10분)
2. 스쿼트: 3세트 x 12회 (세트 간 휴식 1분)
3. 푸시업: 3세트 x 10회 (세트 간 휴식 1분)
4. 쿨다운: 스트레칭 (5분)

**부연 설명 & 팁**
- 이동 간 수분 섭취 권장
- 러닝 전 워밍업 필수
- 카페는 인기 많으니 예약 요망
"""

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 감정 일정 전문가입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.7,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logging.error("OpenAI 호출 오류 (generate_plan):", exc_info=e)
        raise RuntimeError("AI 응답 생성 중 문제가 발생했습니다.")


def generate_location_plan(request_data: Dict) -> str:
    """
    위치 기반 AI 일정 생성 함수
    request_data 예시:
        {
            "latitude": 37.5700,
            "longitude": 126.9830,
            "theme": "카페 투어",
            "user_id": 1
        }
    """
    lat = request_data["latitude"]
    lng = request_data["longitude"]
    theme = request_data["theme"]
    user_id = request_data["user_id"]

    prompt = f"""
사용자 ID: {user_id}
위치: 위도({lat}), 경도({lng})
테마: {theme}

위의 위치 정보를 기준으로, 해당 반경 내에서 '{theme}' 테마에 맞춘 하루 일정을 GFM Markdown 표 형태로 생성하세요.
- 오전 10시부터 오후 6시까지 각각 시간대별(예: 10:00-11:00, 11:00-12:00 등) 추천 장소와 활동을 제시하세요.
- 각 행에 “날짜 | 시간 | 활동 | 이동 소요 시간” 형식으로 작성하세요.
- 표 아래에 부연 설명 및 팁(예: 교통수단, 예약 필요 여부 등)을 간략히 추가하세요.
- 필수로 장소명과 활동에 ‘{theme}’ 키워드를 포함하세요.

예시)
| 날짜       | 시간        | 활동                                      | 예상 소요 시간 |
|-----------|--------------|------------------------------------------|---------------|
| 2025-06-01 | 10:00-11:00   | 한강 카페 데이트 (한강뷰 카페; 필수 키워드: 한강) | 1시간         |
| 2025-06-01 | 11:15-12:15   | 공원 산책 (한강공원 도보 순환로)             | 1시간         |
| 2025-06-01 | 18:00-20:00   | 자전거 러닝 (한강 자전거 도로)               | 2시간         |

**부연 설명 & 팁**
- 카페마다 좌석이 제한적이므로 예약이 필요할 수 있습니다.
- 각 장소 간 이동은 도보로 약 15~20분 소요됩니다.
- 날씨가 추우면 야외 좌석은 피하세요.
"""

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 위치 기반 일정 전문가입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1200,
            temperature=0.7,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logging.error("OpenAI 호출 오류 (generate_location_plan):", exc_info=e)
        raise RuntimeError("위치 기반 일정 생성 중 문제가 발생했습니다.")