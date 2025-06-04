import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { startOfWeek, startOfMonth, isSameWeek, isSameMonth } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ActivityAnalytics = ({ events }) => {
  const [range, setRange] = useState("week");

  const now = new Date();
  const filtered = events.filter(event =>
    range === "week"
      ? isSameWeek(new Date(event.start), now)
      : isSameMonth(new Date(event.start), now)
  );

  const locationCount = {};
  const emotionCount = {};

  filtered.forEach(e => {
    if (e.location) locationCount[e.location] = (locationCount[e.location] || 0) + 1;
    if (e.emotion) emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1;
  });

  const locationBar = {
    labels: Object.keys(locationCount),
    datasets: [{
      label: "방문 횟수",
      data: Object.values(locationCount),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  const emotionPie = {
    labels: Object.keys(emotionCount),
    datasets: [{
      label: "감정 빈도",
      data: Object.values(emotionCount),
      backgroundColor: [
        '#f87171', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa', '#f472b6',
      ],
    }],
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-700">📈 {range === "week" ? "이번 주" : "이번 달"} 활동 분석</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border p-2 rounded text-sm"
        >
          <option value="week">이번 주</option>
          <option value="month">이번 달</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-center font-semibold mb-2">📍 자주 가는 장소</h3>
          <Bar data={locationBar} />
        </div>
        <div>
          <h3 className="text-center font-semibold mb-2">😊 감정 분포</h3>
          <Pie data={emotionPie} />
        </div>
      </div>
    </div>
  );
};

export default ActivityAnalytics;