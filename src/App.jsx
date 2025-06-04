import React, { useState } from 'react'
import './App.css'
import { Navigate, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import RegisterPage from "./pages/RegisterPage";
import PlannerPage from './pages/PlannerPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FindIdPage from './pages/FindIdPage';
import SchedulerPage from './pages/SchedulerPage';
import MapPage from "./pages/MapPage";
import { useAuth } from "./contexts/AuthContext";
import ViewPage from "./pages/ViewPage";
import CallbackKakaoPage from "./pages/CallbackKakaoPage";
import CallbackNaverPage from "./pages/CallbackNaverPage";
import AiPlanPage from "./pages/AiPlanPage";
import MyPage from './pages/MyPage';
import ManageSchedulersPage from "./pages/ManageSchedulersPage";




function App() {
  const { user, loading } = useAuth(); // ✅ 이 줄이 없으면 ReferenceError 발생

  if (loading) return <div>로딩 중...</div>;

  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/planner" element={user ? <PlannerPage /> : <Navigate to="/login" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/find-id" element={<FindIdPage />} />
      <Route path="/scheduler" element={<SchedulerPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/view/:id" element={<ViewPage />} />
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/oauth/callback/kakao" element={<CallbackKakaoPage />} />
      <Route path="/oauth/callback/naver" element={<CallbackNaverPage />} />
      <Route path="/ai-plan" element={<AiPlanPage />} />
      <Route path="/mypage" element={user ? <MyPage /> : <Navigate to="/login" />} />
      <Route path="/manage-schedulers" element={<ManageSchedulersPage />} />
    </Routes>
  );
}

export default App;