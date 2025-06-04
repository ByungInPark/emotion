/* 파일 위치: frontend/src/pages/HomePage.jsx */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { Link } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 flex items-center justify-center px-6">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12">

        {/* 소개 영역 */}
        <div className="flex-1 text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            당신의 감정에 맞는 <br />
            <span className="text-purple-600">Emotion Planner</span>
          </h1>
          <p className="text-gray-600 text-lg">
            오늘 기분이 어떤가요? 감정과 날씨를 기반으로 딱 맞는 일정 플랜을 추천해드릴게요.
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          {user ? (
            <Link
              to="/mypage"
              className="w-64 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg shadow"
            >
            마이페이지
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-64 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow"
            >
              로그인
            </Link>
          )}

          <button
            onClick={() => navigate("/planner")}
            className="w-64 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow"
          >
            플래너 
          </button>

          <button
            onClick={() => navigate("/manage-schedulers")}
            className="w-64 py-3 bg-green-500 text-white rounded-lg text-lg shadow-md hover:bg-green-600 transition"
          >
            스케줄러 
          </button>

          <button
            onClick={() => navigate("/map")}
            className="w-64 py-3 bg-yellow-500 text-white rounded-lg text-lg shadow-md hover:bg-yellow-600 transition"
          >
            지도 보기
          </button>

          {/* AI 페이지 버튼 추가 */}
          <button
            onClick={() => navigate("/ai-plan")}
            className="w-64 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow hover:bg-indigo-600 transition"
          >
            AI 플랜 생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
