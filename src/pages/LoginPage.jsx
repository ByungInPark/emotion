import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage(){
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const { user, loadUser, setUser } = useAuth(); 

  useEffect(() => {
    if (user) {
      navigate("/mypage");
    }
  }, [user, navigate]);

  // 팝업에서 보내주는 메세지 수신
  useEffect(() => {
    const listener = (event) => {
      if (event.origin !== window.location.origin) return;
      const { token, error } = event.data;
  
      if (token) {
        localStorage.setItem("token", token);
        window.location.href = "/planner";
      } else if (error) {
        alert("소셜 로그인 실패");
      }
    };
  
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);
  
  const handleKakao = () => {
    const KAKAO_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
    const kakaoUrl =
      `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code&scope=profile_nickname,account_email`;

    console.log("🔗 카카오 URL:", kakaoUrl);
    window.open(kakaoUrl, "kakao_login", "width=500,height=600");
  };
  
  // ✅ 네이버 로그인 팝업
  const handleNaver = () => {
    const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
    const NAVER_REDIRECT_URI = import.meta.env.VITE_NAVER_REDIRECT_URI;
    const STATE = "naverLoginState123"; // 임의의 보안용 문자열

    const naverUrl =
      `https://nid.naver.com/oauth2.0/authorize?response_type=code` +
      `&client_id=${NAVER_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}` +
      `&state=${STATE}`;

    console.log("🔗 네이버 URL:", naverUrl);
    window.open(naverUrl, "naver_login", "width=500,height=600");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      const res = await login(email, pw); // 로그인 요청
      const token = res.access_token;
  
      if (!token) {
        setError("서버 응답이 이상합니다.");
        return;
      }
  
      // ✅ 토큰 저장
      localStorage.setItem("token", token);
  
      // ✅ 유저 정보 즉시 가져오기
      await loadUser();

      navigate("/MainPage");  // ✅ 즉시 이동
    } catch (err) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white-50 to-white">
      <div className="w-full max-w-md p-10 bg-white border border-gray-500 rounded-3xl space-y-6">
        <Link to="/" className="text-3xl font-extrabold text-center text-blue-600 tracking-tight">Emotion Planner</Link>
        <p className="text-sm text-center text-gray-500 mb-4">감정 기반 일정 관리를 시작해보세요</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="아이디"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full p-4 border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            required
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className={`w-full ${loading ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'} text-white py-3 rounded-xl text-lg font-semibold transition`}
            disabled={loading}
          >
            {loading ? '로그인 중…' : '로그인'}
          </button>
          <button onClick={() => navigate('/forgot-password')} className="hover:underline">
            비밀번호 찾기
          </button>
          <span> | </span>
          <button onClick={() => navigate('/find-id')} className="hover:underline">
            아이디 찾기
          </button>
          <span> | </span>
          <button onClick={() => navigate('/register')} className="hover:underline">
            회원가입
          </button>
        </form>
        <button type="button" className="w-full py-2 bg-yellow-600 rounded hover:bg-yellow-700 text-white font-bold mt-2" onClick={handleKakao}>
          카카오 로그인
        </button>
        <button type="button" className="w-full py-2 bg-green-600 rounded hover:bg-green-700 text-white font-bold mt-2" onClick={handleNaver}>
          네이버 로그인
        </button>
      </div>
    </div>
  );
};