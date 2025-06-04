import React from "react";

const Header = () => {
  return (
    <header className="bg-blue-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">AI 감정 플래너</h1>
      <div className="text-sm">📍 서울 | ☀️ 24°C 맑음</div>
    </header>
  );
};

export default Header; // ✅ 꼭 있어야 합니다!