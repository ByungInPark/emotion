import axios from "axios";

export const getSchedules = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("로그인 토큰이 없습니다.");

  // ⬇️ 여기 경로를 단일 /api/schedules 로 수정
  const res = await axios.get("http://localhost:8001/api/schedules", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};