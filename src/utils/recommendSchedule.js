export const recommendSchedule = (weather, emotion) => {
    if (!weather || !emotion) return "추천할 수 없습니다.";
  
    const sky = weather.find(item => item.category === "SKY")?.fcstValue;
    const tmp = weather.find(item => item.category === "TMP")?.fcstValue;
  
    // --- 감정별 추천 플랜
    if (emotion === "happy" && sky === "1") {
      return "☀️ 맑은 날씨에 기분 좋게 야외 피크닉을 즐겨보세요!";
    }
    if (emotion === "sad") {
      if (sky === "3" || sky === "4") {
        return "☁️ 흐림이나 비오는 날, 포근한 카페에서 힐링 타임을 가져보세요!";
      }
      return "📚 조용한 공간에서 독서나 자기만의 시간을 추천해요.";
    }
    if (emotion === "angry") {
      if (tmp > 28) {
        return "🛍️ 더운 날엔 시원한 쇼핑몰 나들이 추천! 스트레스 해소해봐요!";
      }
      return "🏃‍♂️ 짜증날 땐 가벼운 운동이나 산책으로 기분 전환 어떨까요?";
    }
    if (emotion === "tired") {
      return "🎬 피곤할 땐 따뜻한 차 한잔과 함께 영화 감상 추천!";
    }
  
    // --- 기본
    return "오늘 하루도 힘내세요! 💪";
  };