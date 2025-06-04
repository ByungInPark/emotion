import React, { useRef, useState, useEffect } from "react";
import EmotionFilter from "../components/EmotionFilter";
import PlannerForm from "../components/PlannerForm";
import PlannerList from "../components/PlannerList";
import Calendar from "react-calendar";
import AiRecommendation from "../components/AiRecommendation";
import WeatherBox from "../components/WeatherBox";
import MapView from "../components/MapView";
import ScheduleModal from '@/components/ScheduleModal';
import StatsDashboard from "@/components/StatsDashboard";
import SharePanel from "@/components/SharePanel";
import SummaryCard from "@/components/SummaryCard";
import { getKmaWeather } from "../utils/weather";
import { getMidForecast } from "@/utils/getMidForecast";
import { recommendSchedule } from "../utils/recommendSchedule";
import { MENU } from "@/constants/menu";
import ActivityAnalytics from '@/components/ActivityAnalytics';
import 'react-calendar/dist/Calendar.css';
import DarkModeToggle from "../components/DarkModeToggle";
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PlannerPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEmotion, setSelectedEmotion] = useState("전체");
  const [weatherData, setWeatherData] = useState([]);
  const [recommendation, setRecommendation] = useState("");
  const [activeMenu, setActiveMenu] = useState(MENU.RECOMMEND);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [midForecast, setMidForecast] = useState(null);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleSave = (newEvent) => {
    setEvents((prev) => [...prev, { ...newEvent, id: Date.now().toString() }]);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setIsModalOpen(false);
  };

  const handleAddEvent = (newEvent) => {
    setEvents([newEvent, ...events]);
  };

  const filteredEvents =
    selectedEmotion === "전체"
      ? events
      : events.filter((e) => e.emotion === selectedEmotion);

  useEffect(() => {
    const fetchWeather = async () => {
      const short = await getKmaWeather();
      const mid = await getMidForecast("11B00000");
      setWeatherData(short);
      setMidForecast(mid);
    };
    fetchWeather();
  }, []);

  useEffect(() => {
    if (weatherData.length > 0 && selectedEmotion) {
      const schedule = recommendSchedule(weatherData, selectedEmotion);
      setRecommendation(schedule);
    }
  }, [weatherData, selectedEmotion]);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50">
      {/* 사이드 메뉴 */}
      <aside className="w-52 bg-white dark shadow p-4 shrink-0">
        <h2 to="/" className="text-xl font-bold text-green-600 mb-4">📚 메뉴</h2>
        <DarkModeToggle />
        {Object.entries(MENU).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveMenu(MENU[key])}
            className={`w-full text-left p-2 rounded-md text-sm ${
              activeMenu === MENU[key]
                ? "bg-green-200 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
        <hr className="my-4" />
        <EmotionFilter
          selectedEmotion={selectedEmotion}
          setSelectedEmotion={setSelectedEmotion}
        />
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-hidden">
        {activeMenu === MENU.RECOMMEND && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <section className="bg-white p-8 rounded-2xl shadow-xl col-span-full">
              <Link to="/" className="text-3xl font-bold text-center text-purple-700 mb-6">
              Emotion Planner
              </Link>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeatherBox weather={weatherData} midForecast={midForecast} />
                <AiRecommendation />
              </div>
              <div className="mt-10">
                <SummaryCard events={events} />
              </div>
            </section>

            {recommendation && (
              <div className="col-span-full flex justify-center">
                <div className="bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 text-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-3 text-center">✨ 오늘의 추천 일정</h2>
                  <p className="text-center text-lg">{recommendation}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeMenu === MENU.MANAGE && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow">
              <PlannerForm onAddEvent={handleAddEvent} />
            </div>
            <div className="bg-white p-8 rounded-2xl shadow flex justify-center items-center">
              <Calendar value={selectedDate} onChange={setSelectedDate} />
            </div>
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow">
              <PlannerList events={filteredEvents} />
            </div>
          </div>
        )}

        {activeMenu === MENU.STATS && (
        <div className="space-y-8">
          <StatsDashboard events={events} />
        </div>
        )}

        {activeMenu === MENU.MY && (
          <div className="space-y-8">
            {user ? (
              <>
                <div className="bg-white p-6 rounded-xl shadow space-y-2">
                  <h2 className="text-xl font-bold mb-3">👤 내 정보</h2>
                  <p>이름: <span className="font-medium">{user.name}</span></p>
                  <p>닉네임: <span className="font-medium">{user.username}</span></p>
                  <p>이메일: <span className="font-medium">{user.email}</span></p>
                  <p>생년월일: <span className="font-medium">{user.birth}</span></p>
                  <p>가입일: <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span></p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow space-y-2">
                  <h2 className="text-xl font-bold mb-3">📊 활동 통계</h2>
                  <p>등록한 일정 수: <span className="font-medium">42개</span></p>
                  <p>메모 수: <span className="font-medium">17개</span></p>
                  <p>가장 많이 느낀 감정: <span className="font-medium">행복</span></p>
                </div>

                <SharePanel shareUrl="https://emotion-planner.vercel.app/view/1234" />

                <div className="bg-white p-6 rounded-xl shadow space-y-4">
                  <h2 className="text-xl font-bold mb-3">⚙️ 계정 관리</h2>
                  <button onClick={() => navigate("/mypage")}  className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">정보 수정</button>
                  <button onClick={logout} className="w-full py-2 bg-gray-500 text-white rounded hover:bg-gray-600">로그아웃</button>
                  <button className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600">회원 탈퇴</button>
               </div>
            </>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
            🔐 로그인 후 내 정보가 표시됩니다.
          </div>
        )}
      </div>
      )}
    </main>

      {/* 공통 모달 */}
      {isModalOpen && (
        <ScheduleModal
          event={selectedEvent}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PlannerPage;