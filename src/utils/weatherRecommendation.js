// src/utils/weatherRecommendation.jsx
export const getRecommendationByWeather = (weather) => {
    const templates = {
      Clear: "☀️ 날씨가 좋아요! 공원 산책이나 야외 카페 어때요?",
      Rain: "🌧 비 오는 날엔 실내 영화관이나 전시회 데이트가 딱!",
      Clouds: "☁️ 흐린 날엔 조용한 북카페에서 힐링 추천!",
      Snow: "❄️ 눈 오는 날엔 따뜻한 카페나 실내데이트 어때요?",
    };
  
    return templates[weather] || "😐 오늘은 평범한 날이에요. 자유롭게 계획해보세요!";
  };