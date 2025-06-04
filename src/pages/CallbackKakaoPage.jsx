import { useEffect } from "react";
import axios from "axios";

const CallbackKakaoPage = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    console.log("카카오 code 확인:", code);

    (async () => {
      try {
        const res = await axios.post("http://localhost:8001/auth/kakao/callback", { code });
        const token = res.data.access_token;

        if (window.opener) {
          window.opener.postMessage({ token }, window.location.origin);
          window.close();
        } else {
          window.location.href = "/planner";
        }
      } catch {
        window.opener?.postMessage({ error: true }, window.location.origin);
        window.close();
      }
    })();
  }, []);

  return <p>카카오 로그인 중...</p>;
};

export default CallbackKakaoPage;