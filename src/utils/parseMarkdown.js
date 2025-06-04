import dayjs from "dayjs";

/**
 * @param {string} markdown AI가 반환한 마크다운 표 문자열
 * @returns {Array} [
 *   {
 *     title: string,       // "{추천 활동} @ {장소 이름}"
 *     start: string,       // ISO 8601 문자열, 예: "2025-06-10T10:00:00"
 *     end: string,         // ISO 8601 문자열
 *     location: string,    // 장소 이름
 *     memo: string,        // (선택) 이동 소요 시간 및 기타 정보
 *   },
 *   ...
 * ]
 */
export function parseMarkdownToEvents(markdown) {
  const lines = markdown.trim().split("\n");
  // 헤더(| 시간 | 장소 이름 | ...)와 구분선(| --- | --- | ...) 제외
  const dataLines = lines.filter((line) => /^ *\| *\d{2}:\d{2}-\d{2}:\d{2}/.test(line));

  if (dataLines.length === 0) {
    throw new Error("AI가 반환한 마크다운 표에서 일정 데이터를 찾을 수 없습니다.");
  }

  const events = [];
  dataLines.forEach((row) => {
    // 예시 row: "| 10:00-11:00   | 카페 A      | 커피 즐기기     | 10분         |"
    const cols = row.split("|").map((c) => c.trim());
    // cols 배열: ["", "10:00-11:00", "카페 A", "커피 즐기기", "10분", ""]
    if (cols.length < 5) return;

    const timeRange = cols[1]; // "10:00-11:00"
    const placeName = cols[2]; // "카페 A"
    const activity = cols[3];  // "커피 즐기기"
    const travelInfo = cols[4]; // "10분"

    // 시간 분리
    const [startTimeStr, endTimeStr] = timeRange.split("-");
    // (확실하지 않음) 날짜 지정: “오늘” 대신 명시적인 날짜를 AI에 요청하지 않았으므로
    // 임시로 현재 날짜(=오늘)로 설정하거나, 실제로 사용자가 원하는 날짜를 입력받아야 함.
    // 여기서는 “오늘” 기준으로 예시 구현:
    const today = dayjs().format("YYYY-MM-DD"); // 예: "2025-06-08" (현재 날짜)
    const startISO = dayjs(`${today}T${startTimeStr}:00`).toISOString();
    const endISO = dayjs(`${today}T${endTimeStr}:00`).toISOString();

    events.push({
      title: `${activity} @ ${placeName}`,
      start: startISO,
      end: endISO,
      location: placeName,
      memo: `이동: ${travelInfo}`,
    });
  });

  return events;
}