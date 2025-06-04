import React from "react";

const WeatherBox = ({ weather, midForecast }) => {
  if (!Array.isArray(weather) || weather.length === 0) {
    return <div className="text-center text-gray-500">☁️ 날씨 정보를 불러오는 중...</div>;
  }

  // ✅ 중복 제거 버전
  const timeData = {};
  weather.forEach(item => {
    if (item.category === 'TMP' || item.category === 'POP') {
      const time = item.fcstTime;
      if (!timeData[time]) timeData[time] = {};
      if (!timeData[time][item.category]) timeData[time][item.category] = item.fcstValue;
    }
  });

  const sortedTimes = Object.keys(timeData).sort();

  return (
    <div className="bg-white p-4 rounded-2xl shadow-xl w-full space-y-6">
      <h2 className="text-xl font-bold text-center">🌦️ 오늘 & 중기 날씨</h2>

      {/* ✅ 오늘 시간별 예보 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold border-b pb-1">📍 오늘 시간별 예보</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 max-h-[150px]">
          {sortedTimes.map((time, index) => (
            <div
              key={index}
              className="min-w-[100px] flex-shrink-0 border rounded-lg bg-blue-50 shadow p-2 space-y-1 text-xs"
            >
              <p className="font-semibold text-center text-blue-800">{time.slice(0,2)}시</p>
              {timeData[time].TMP && <p>🌡️ 기온: {timeData[time].TMP}</p>}
              {timeData[time].POP && <p>☔ 강수확률: {timeData[time].POP}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ 중기예보 그대로 유지 */}
      {midForecast ? (
        <div>
          <h3 className="text-sm font-semibold border-b pb-1 mb-2">📆 중기예보 (3~7일 후)</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[3, 4, 5, 6, 7].map((d) => (
              <div
                key={d}
                className="min-w-[100px] flex-shrink-0 border rounded-lg bg-blue-50 shadow p-2 space-y-1 text-xs"
              >
                <p className="font-semibold text-center text-blue-800">+{d}일</p>
                <p>☁️ 하늘: {midForecast.land?.[`wf${d}Am`] ?? "-"} / {midForecast.land?.[`wf${d}Pm`] ?? "-"}</p>
                <p>🌡️ 기온: {midForecast.temp?.[`taMin${d}`] ?? "-"}°C ~ {midForecast.temp?.[`taMax${d}`] ?? "-"}°C</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-400">🛰️ 중기예보 데이터를 불러오는 중입니다.</p>
      )}
    </div>
  );
};

export default WeatherBox;