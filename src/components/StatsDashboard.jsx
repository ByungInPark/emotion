import React, { useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { startOfWeek, startOfMonth, isAfter } from 'date-fns';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const StatsDashboard = ({ events }) => {
  const [range, setRange] = useState('week');

  const startDate = range === 'week'
    ? startOfWeek(new Date(), { weekStartsOn: 1 })
    : startOfMonth(new Date());

  const filtered = events.filter(e => isAfter(new Date(e.start), startDate));

  // 🎭 감정 카운트
  const emotionCounts = filtered.reduce((acc, cur) => {
    if (cur.emotion) acc[cur.emotion] = (acc[cur.emotion] || 0) + 1;
    return acc;
  }, {});

  // 📅 일별 감정 변화qud
  const dateEmotionMap = {};
  filtered.forEach((event) => {
    const date = new Date(event.start).toISOString().slice(0, 10);
    if (!dateEmotionMap[date]) dateEmotionMap[date] = {};
    dateEmotionMap[date][event.emotion] = (dateEmotionMap[date][event.emotion] || 0) + 1;
  });

  const uniqueEmotions = [...new Set(filtered.map(e => e.emotion))];
  const dateLabels = Object.keys(dateEmotionMap).sort();

  const barData = {
    labels: dateLabels,
    datasets: uniqueEmotions.map(emotion => ({
      label: emotion,
      data: dateLabels.map(date => dateEmotionMap[date][emotion] || 0),
      backgroundColor: `hsl(${Math.random() * 360}, 70%, 70%)`
    }))
  };

  const pieData = {
    labels: Object.keys(emotionCounts),
    datasets: [{
      data: Object.values(emotionCounts),
      backgroundColor: ['#f87171', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa', '#f472b6']
    }]
  };

  // 📥 추가 부분: 요일별 활동량
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // 월~일
  filtered.forEach(e => {
    const day = new Date(e.start).getDay();
    const idx = day === 0 ? 6 : day - 1;
    dayCounts[idx]++;
  });

  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
  const dayData = {
    labels: dayLabels,
    datasets: [{
      label: '요일별 활동량',
      data: dayCounts,
      backgroundColor: '#60a5fa'
    }]
  };

  // 📥 추가 부분: 시간대별 활동량
  const hourCounts = new Array(24).fill(0);
  filtered.forEach(e => {
    const hour = new Date(e.start).getHours();
    hourCounts[hour]++;
  });

  const hourData = {
    labels: [...Array(24).keys()].map(h => `${h}시`),
    datasets: [{
      label: '시간대별 활동량',
      data: hourCounts,
      backgroundColor: '#34d399'
    }]
  };

  // 📥 추가 부분: 태그 카운트
  const tagCounts = filtered.reduce((acc, cur) => {
    if (cur.tag) acc[cur.tag] = (acc[cur.tag] || 0) + 1;
    return acc;
  }, {});

  const tagData = {
    labels: Object.keys(tagCounts),
    datasets: [{
      data: Object.values(tagCounts),
      backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#f472b6']
    }]
  };

  // 📥 추가 부분: 목표 달성률
  const totalEvents = filtered.length;
  const completedEvents = filtered.filter(e => e.completed).length;
  const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  const goalData = {
    labels: ['완료', '미완료'],
    datasets: [{
      label: '목표 달성률',
      data: [completedEvents, totalEvents - completedEvents],
      backgroundColor: ['#34d399', '#f87171']
    }]
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-8">
      <h2 className="text-2xl font-bold">📊 활동 통계 ({range === 'week' ? '이번주' : '이번달'})</h2>

      <div className="flex gap-4">
        <button
          onClick={() => setRange('week')}
          className={`px-4 py-2 rounded ${range === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          이번주
        </button>
        <button
          onClick={() => setRange('month')}
          className={`px-4 py-2 rounded ${range === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          이번달
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 감정 분포 */}
        <div>
          <h3 className="text-center font-semibold mb-2">😊 감정 분포</h3>
          {Object.keys(emotionCounts).length > 0 ? (
            <Pie data={pieData} />
          ) : (
            <p className="text-center text-gray-400">데이터 없음</p>
          )}
        </div>

        {/* 일별 감정 변화 */}
        <div>
          <h3 className="text-center font-semibold mb-2">📅 일별 감정 변화</h3>
          {dateLabels.length > 0 ? (
            <Bar data={barData} />
          ) : (
            <p className="text-center text-gray-400">데이터 없음</p>
          )}
        </div>

        {/* 📥 추가: 요일별 활동량 */}
        <div>
          <h3 className="text-center font-semibold mb-2">📆 요일별 활동량</h3>
          {filtered.length > 0 ? (
            <Bar data={dayData} />
          ) : (
            <p className="text-center text-gray-400">데이터 없음</p>
          )}
        </div>

        {/* 📥 추가: 시간대별 활동량 */}
        <div>
          <h3 className="text-center font-semibold mb-2">⏰ 시간대별 활동량</h3>
          {filtered.length > 0 ? (
            <Bar data={hourData} />
          ) : (
            <p className="text-center text-gray-400">데이터 없음</p>
          )}
        </div>

        {/* 📥 추가: 태그별 일정 비율 */}
        <div>
          <h3 className="text-center font-semibold mb-2">🏷️ 태그별 일정 비율</h3>
          {Object.keys(tagCounts).length > 0 ? (
            <Pie data={tagData} />
          ) : (
            <p className="text-center text-gray-400">데이터 없음</p>
          )}
        </div>

        {/* 📥 추가: 목표 달성률 */}
        <div>
          <h3 className="text-center font-semibold mb-2">🎯 목표 달성률</h3>
          {totalEvents > 0 ? (
            <Bar data={goalData} />
          ) : (
            <p className="text-center text-gray-400">데이터 없음</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;