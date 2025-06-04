import axios from "axios";

// 위도/경도 → 기상청 격자 변환 함수
function convertToGrid(lat, lon) {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1
  const SLAT2 = 60.0; // 투영 위도2
  const OLON = 126.0; // 기준 경도
  const OLAT = 38.0; // 기준 위도
  const XO = 43; // 기준 X좌표
  const YO = 136; // 기준 Y좌표

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf =
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro =
    Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  const ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  const xy = {};
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  xy.x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  xy.y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  return xy;
}

// ✅ 기상청 API 호출
export const getKmaWeather = async () => {
  const apiKey = import.meta.env.VITE_KMA_KEY;
  const now = new Date();
  const baseDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  const baseTime = '0500'; // 기본값 예시

  const nx = 60;
  const ny = 127;

  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;
  try {
    const res = await axios.get(url);
    const data = res.data;

    console.log("✅ 날씨:", data.response?.body?.items?.item);
    console.log("📦 전체 응답 데이터:", data);

    if (data?.response?.body?.items?.item) {
      return data.response.body.items.item;
    } else {
      console.warn("❗ 날씨 데이터 없음", data);
      return [];
    }
  } catch (err) {
    console.error("❌ 날씨 요청 오류:", err.response?.data || err.message);
    return [];
  }
};