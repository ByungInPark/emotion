import axios from "axios";

export const getMidForecast = async (regId = "11B00000") => {
  const key = import.meta.env.VITE_KMA_KEY;
  const now = new Date();
  const baseDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  const tmFc = `${baseDate}0600`;

  const landUrl = `https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst?serviceKey=${key}&dataType=JSON&regId=${regId}&tmFc=${tmFc}`;
  const taUrl = `https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa?serviceKey=${key}&dataType=JSON&regId=${regId}&tmFc=${tmFc}`;

  try {
    const [landRes, taRes] = await Promise.all([
      axios.get(landUrl),
      axios.get(taUrl),
    ]);

    const land = landRes.data.response?.body?.items?.item?.[0] || {};
    const temp = taRes.data.response?.body?.items?.item?.[0] || {};

    return { land, temp };
  } catch (err) {
    console.error("❌ 중기예보 오류:", err.response?.data || err.message);
    return null;
  }
};