import React from "react";
import { format, isThisWeek, isToday } from "date-fns";

const SummaryCard = ({ events }) => {
  const thisWeekEvents = events.filter((event) => isThisWeek(new Date(event.start)));
  const todayEvents = events.filter((event) => isToday(new Date(event.start)));
  const importantEvents = events.filter((event) => event.priority === "매우 중요");

  const emotionCounts = {};
  events.forEach((event) => {
    if (event.emotion) {
      emotionCounts[event.emotion] = (emotionCounts[event.emotion] || 0) + 1;
    }
  });

  const topEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "없음";

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-3">
      <h2 className="text-xl font-bold mb-2 text-green-600">☀️ 이번 주 요약</h2>
      <p>📅 이번 주 일정: <strong>{thisWeekEvents.length}</strong> 개</p>
      <p>😊 가장 많이 느낀 감정: <strong>{topEmotion}</strong></p>
      <p>📌 우선순위 높은 일정: <strong>{importantEvents.length}</strong> 개</p>
      <p>🕒 오늘 일정:</p>
      <ul className="list-disc ml-5 text-sm text-gray-700">
        {todayEvents.length > 0
          ? todayEvents.map((e, idx) => (
              <li key={idx}>{format(new Date(e.start), "HH:mm")} - {e.title}</li>
            ))
          : <li>오늘 일정 없음</li>}
      </ul>
    </div>
  );
};

export default SummaryCard;