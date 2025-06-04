import { useEffect } from "react";
import axios from "axios";

const CallbackNaverPage = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    (async () => {
      try {
        const res = await axios.get(
          `http://localhost:8001/auth/naver/callback?code=${code}&state=${state}`
        );
        // 부모 창에 토큰 전달 후 팝업 종료
        localStorage.setItem("token", res.data.access_token);
        window.opener.postMessage({ token: res.data.access_token }, window.location.origin);
      } catch (err) {
        console.error("로그인 실패", err);
        window.opener.postMessage({ error: true }, window.origin);
      } finally {
        window.close();
      }
    })();
  }, []);

  return <p>네이버 로그인 중...</p>;
};

export default CallbackNaverPage;