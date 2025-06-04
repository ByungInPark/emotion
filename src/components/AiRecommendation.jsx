import React from "react";
import { Link } from 'react-router-dom';

const AiRecommendation = () => {
  // 실제 사용 시 추천 항목은 props 또는 context로 받아와도 좋아요!
  const recommendedPlans = [
    "실내 전시관 관람",
    "카페 데이트",
    "한강 산책 코스",
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-md">
      <Link to="/ai-plan" className="text-lg font-bold text-gray-800 mb-4">🤖 AI 추천 일정</Link>
      <ul className="space-y-2">
        {recommendedPlans.map((plan, idx) => (
          <li
            key={idx}
            className="bg-blue-100 px-4 py-2 rounded text-gray-700 hover:bg-blue-200 transition"
          >
            {plan}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AiRecommendation;