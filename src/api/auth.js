import axios from "axios";

export const login = async (email, password) => {
  try {
    const res = await axios.post("http://localhost:8001/api/users/login", {
      email,
      password,
    });

    console.log("✅ 로그인 응답:", res.data);

    const token = res.data.access_token;
    if (token) {
      localStorage.setItem("token", token);
      console.log("✅ 토큰 저장 완료:", token);
    } else {
      console.warn("❌ 응답에 access_token이 없음");
    }

    return res.data;
  } catch (err) {
    console.error("❌ 로그인 실패:", err.response?.data || err.message);
  }
};

export const register = async (username, email, recovery_email, password, name, birth) => {
  const res = await axios.post("http://localhost:8001/api/users/register", {
    username,
    email,
    recovery_email,
    password,
    name,
    birth,
  });
  return res.data;
};

export const fetchMyInfo = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("❌ fetchMyInfo: 토큰이 없습니다. 로그인 먼저 필요.");
    return null;  // 에러 대신 null로 반환
  }

  const res = await axios.get("http://localhost:8001/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const deleteMyAccount = async () => {
  const token = localStorage.getItem("token");
  return await axios.delete("http://localhost:8001/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};