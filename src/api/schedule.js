import axiosInstance from "./axiosInstance";

export const getSchedules = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("로그인 토큰이 없습니다.");

  // baseURL: ".../api"
  // GET "/schedules" → "http://localhost:8000/api/schedules"
  const response = await axiosInstance.get("/schedules", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};