import React, { useState, useEffect } from "react";
import MapView from "@/components/MapView";
import PlannerList from "@/components/PlannerList";
import MemoSection from "@/components/MemoSection";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance"; // baseURL: http://localhost:8001/api
import { extractSchedulesFromPlan } from "@/utils/aiPlanParser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MapPage = () => {
  const navigate = useNavigate();

  // ────────────────────────────────────────────────────────────────────────
  // 1) 스케줄러 목록 및 선택 상태
  // ────────────────────────────────────────────────────────────────────────
  const [schedulers, setSchedulers] = useState([]);
  const [selectedSchedulerId, setSelectedSchedulerId] = useState(null);

  useEffect(() => {
    async function loadSchedulers() {
      try {
        // axiosInstance.baseURL = http://localhost:8001/api 이므로,
        // 여기서는 "/schedulers" 만 붙여서 최종 경로는 http://localhost:8001/api/schedulers 가 됩니다.
        const res = await axiosInstance.get("/schedulers");
        if (res.data && res.data.length > 0) {
          setSchedulers(res.data);
          setSelectedSchedulerId(res.data[0].id);
        }
      } catch (err) {
        console.error("스케줄러 목록 로드 실패:", err);
      }
    }
    loadSchedulers();
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // 2) 지도에서 카테고리 검색 기능 (기존 그대로)
  // ────────────────────────────────────────────────────────────────────────
  const [plan, setPlan] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [emotion, setEmotion] = useState("");
  const [activities, setActivities] = useState("");
  const [requiredKeywords, setRequiredKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [koOpen, setkoOpen] = useState(false);

  const handleSearchCategory = (category) => {
    if (!window.globalKakaoMapInstance) {
      alert("지도가 아직 로드되지 않았습니다.");
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const location = new window.kakao.maps.LatLng(lat, lng);
          window.globalKakaoMapInstance.setCenter(location);
          window.dispatchEvent(
            new CustomEvent("trigger-category-search", {
              detail: { category, location },
            })
          );
        },
        () => {
          const location = window.globalKakaoMapInstance.getCenter();
          window.dispatchEvent(
            new CustomEvent("trigger-category-search", {
              detail: { category, location },
            })
          );
        }
      );
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // 3) 지도 위 장소 선택 → AI 위치 기반 일정 생성
  // ────────────────────────────────────────────────────────────────────────
  const [selectedPlace, setSelectedPlace] = useState({
    id: null,
    name: "",
    address: "",
    latitude: null,
    longitude: null,
  });
  const [selectedTheme, setSelectedTheme] = useState("");
  const [locationPlan, setLocationPlan] = useState("");
  const [loadingLocationPlan, setLoadingLocationPlan] = useState(false);

  // MapView 컴포넌트에서 마커 클릭 시 호출
  const handlePlaceSelect = (place) => {
    // Kakao API에서 place.y/place.x가 문자열(string)일 수 있어서 Number()로 변환
    setSelectedPlace({
      id: place.id ?? null,
      name: place.name,
      address: place.address || "",
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
    });
    setLocationPlan("");
  };

  // “위치 기반 AI 일정 생성” 버튼 클릭
  const handleGenerateLocationPlan = async () => {
    if (
      selectedPlace.latitude === null ||
      selectedPlace.longitude === null ||
      !selectedTheme
    ) {
      alert("먼저 지도에서 장소를 선택하고, 테마를 골라주세요.");
      return;
    }
    setLoadingLocationPlan(true);
    try {
      const payload = {
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        theme: selectedTheme,
        user_id: 0, // 필요한 경우, 실제 로그인된 user ID로 변경
      };
      // 최종 경로: http://localhost:8001/api/ai/location-plan
      const res = await axiosInstance.post("/ai/location-plan", payload);
      setLocationPlan(res.data.plan);
    } catch (err) {
      console.error("위치 기반 AI 일정 생성 실패:", err.response || err);
      alert("AI 일정 생성 중 오류가 발생했습니다.");
    } finally {
      setLoadingLocationPlan(false);
    }
  };

  // “AI 위치 기반 일정 저장” 버튼 클릭 → 파싱 후 /api/schedules에 일괄 저장
  const handleApplyLocationPlan = async () => {
    if (!locationPlan) {
      alert("AI가 생성한 일정이 없습니다.");
      return;
    }
    if (!selectedSchedulerId) {
      alert("AI 일정 저장 시에도 스케줄러를 선택해주세요.");
      return;
    }

    let schedules;
    try {
      schedules = extractSchedulesFromPlan(locationPlan);
      if (schedules.length === 0) {
        return alert("AI가 반환한 일정에서 데이터가 추출되지 않았습니다.");
      }
    } catch (e) {
      console.error("위치 기반 일정 파싱 오류:", e);
      return alert("일정 파싱 중 오류가 발생했습니다.");
    }

    try {
      await Promise.all(
        schedules.map((evt) =>
          axiosInstance.post("/schedules", {
            title: evt.title,
            location: evt.location,
            start: evt.start,
            end: evt.end,
            emotion: "", // 기본값
            memo: evt.memo || "",
            priority: evt.priority || "보통",
            scheduler_id: selectedSchedulerId,
          })
        )
      );
      alert("AI 위치 기반 일정이 성공적으로 저장되었습니다.");
      navigate("/scheduler");
    } catch (err) {
      console.error("AI 위치 기반 일정 저장 실패:", err.response || err);
      alert("일정 저장 중 오류가 발생했습니다.");
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // 4) “장소 클릭 → 즉시 일정 생성” 기능 (기존 handleCreateScheduleFromPlace)
  // ────────────────────────────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateScheduleFromPlace = async (place) => {
    if (!selectedSchedulerId) {
      alert("먼저 스케줄러를 생성하거나 선택해주세요.");
      return;
    }
    const now = new Date();
    const startIso = now.toISOString();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const endIso = oneHourLater.toISOString();

    const payload = {
      title: place.title,
      start: startIso,
      end: endIso,
      emotion: "",
      location: place.location || "",
      memo: "",
      priority: "보통",
      scheduler_id: selectedSchedulerId,
    };

    try {
      const res = await axiosInstance.post("/schedules", payload);
      setEvents((prev) => [
        ...prev,
        {
          id: res.data.id.toString(),
          title: res.data.title,
          start: res.data.start,
          end: res.data.end,
          location: res.data.location,
          emotion: res.data.emotion,
          memo: res.data.memo,
          priority: res.data.priority,
          scheduler_id: res.data.scheduler_id,
        },
      ]);
      alert("일정이 성공적으로 저장되었습니다.");
    } catch (err) {
      console.error("일정 저장 실패:", err.response || err);
      const msg =
        err.response?.data?.detail || err.response?.data || err.message;
      alert(`일정 저장 실패:\n${JSON.stringify(msg, null, 2)}`);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // 5) 기존 “감정 중심 AI 플랜” 기능 (변경 없이 그대로 유지)
  // ────────────────────────────────────────────────────────────────────────
  const handleGenerateAiPlan = async () => {
    if (
      !startDate ||
      !endDate ||
      !emotion.trim() ||
      !activities.trim() ||
      !requiredKeywords.trim()
    ) {
      alert("모든 입력을 채워주세요.");
      return;
    }
    setLoading(true);
    try {
      const resp = await axiosInstance.post("/ai/plan", {
        start_date: startDate,
        end_date: endDate,
        emotion_focus: emotion,
        activity_types: activities.split(",").map((s) => s.trim()),
        required_keywords: requiredKeywords
          .split(",")
          .map((s) => s.trim()),
        user_id: 0, // 필요 시 실제 로그인 사용자 ID로 대체
      });
      setPlan(resp.data.plan);
    } catch (err) {
      console.error(err);
      alert("AI 플랜 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAiPlan = async () => {
    const [markdownPart, memoPart] = plan.split("**부연 설명");
    const schedules = extractSchedulesFromPlan(markdownPart);
    if (schedules.length === 0)
      return alert("일정이 추출되지 않았습니다.");

    if (!selectedSchedulerId) {
      alert("AI 일정 저장 시에도 스케줄러를 선택해주세요.");
      return;
    }

    try {
      await Promise.all(
        schedules.map((evt) =>
          axiosInstance.post("/schedules", {
            title: evt.title,
            location: evt.location,
            start: evt.start,
            end: evt.end,
            emotion: "",
            memo: memoPart?.trim() || "",
            priority: evt.priority || "보통",
            scheduler_id: selectedSchedulerId,
          })
        )
      );
      alert("AI 일정이 성공적으로 저장되었습니다.");
      setEvents((prev) => [
        ...prev,
        ...schedules.map((evt) => ({
          id: Date.now().toString() + Math.random(),
          title: evt.title,
          location: evt.location,
          start: evt.start,
          end: evt.end,
          emotion: "",
          memo: memoPart?.trim() || "",
          priority: evt.priority || "보통",
          scheduler_id: selectedSchedulerId,
        })),
      ]);
    } catch (err) {
      console.error("AI 일정 저장 실패:", err);
      alert("일정 저장 실패");
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // 6) 일정 삭제 및 모달 열기/닫기 (기존)
  // ────────────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setIsModalOpen(false);
  };

  const handleSaveFromModal = (newEvent) => {
    setEvents((prev) => [
      ...prev,
      { ...newEvent, id: Date.now().toString() },
    ]);
    setIsModalOpen(false);
  };

  // ────────────────────────────────────────────────────────────────────────
  // 7) UI 렌더링
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed top-0 left-0 w-full h-full flex overflow-hidden bg-gray-50">

      {/* ────────────────────────────────────────────────────────────────────
          좌측: 사이드바 (스케줄러 선택 + 카테고리 버튼 + AI 플랜)
         ──────────────────────────────────────────────────────────────────── */}
      <aside className="w-60 bg-white p-4 shadow z-10 flex flex-col overflow-y-auto">
        <Link
          to="/"
          className="text-2xl font-bold text-yellow-600 hover:underline mb-2"
        >
          Emotion Planner
        </Link>

        {/* A) 스케줄러 선택 드롭다운 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            스케줄러 선택
          </label>
          <select
            value={selectedSchedulerId || ""}
            onChange={(e) =>
              setSelectedSchedulerId(Number(e.target.value))
            }
            className="w-full border px-2 py-1 rounded"
          >
            <option value="" disabled>
              스케줄러를 선택하세요
            </option>
            {schedulers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          원하는 장소를 검색하고 일정을 추가해보세요.
        </p>

         {/* B) 장소 카테고리 버튼 */}
         <button
          onClick={() => setkoOpen((prev) => !prev)}
          className="mb-2 w-full bg-blue-500 text-white px-3 py-2 rounded"
        >
          컨텐츠
        </button>
        {koOpen && (
          <div className="space-y-2 text-sm mb-4">
            <button
              onClick={() => handleSearchCategory("카페")}
              className="w-full bg-green-100 text-green-800 rounded px-3 py-2 text-left"
            >
              카페
            </button>
            <button
              onClick={() => handleSearchCategory("음식점")}
              className="w-full bg-purple-100 text-purple-800 rounded px-3 py-2 text-left"
            >
              음식점
            </button>
            <button
              onClick={() => handleSearchCategory("전시 / 체험")}
              className="w-full bg-blue-100 text-blue-800 rounded px-3 py-2 text-left"
            >
              전시 / 체험
            </button>
          </div>
         )}

        {/* C) SOS 버튼 (화장실 / 응급실 / ATM) */}
        <button
          onClick={() => setSosOpen((prev) => !prev)}
          className="mb-2 w-full bg-red-500 text-white px-3 py-2 rounded"
        >
          🆘 SOS
        </button>
        {sosOpen && (
          <div className="space-y-2 mb-4 text-sm">
            <button
              onClick={() => handleSearchCategory("화장실")}
              className="w-full bg-red-100 text-red-700 px-3 py-2 rounded text-left"
            >
              화장실
            </button>
            <button
              onClick={() => handleSearchCategory("응급실")}
              className="w-full bg-red-100 text-red-700 px-3 py-2 rounded text-left"
            >
              응급실
            </button>
            <button
              onClick={() => handleSearchCategory("ATM")}
              className="w-full bg-red-100 text-red-700 px-3 py-2 rounded text-left"
            >
              ATM
            </button>
          </div>
        )}

        {/* D) 위치 기반 AI 일정 생성 섹션 */}
        <div className="mt-4 mb-4 space-y-2 text-sm border-t pt-4">
          <h3 className="font-medium mb-2 text-gray-700">위치 기반 AI 일정</h3>

          {/* 선택된 장소 정보 */}
          <div className="mb-2 text-xs text-gray-600">
            <p>
              <span className="font-medium">선택된 장소:</span>{" "}
              {selectedPlace.name || "없음"}
            </p>
            {selectedPlace.latitude !== null &&
             selectedPlace.latitude !== undefined && (
              <p>
                (
                  {Number(selectedPlace.latitude).toFixed(6)},{" "}
                  {Number(selectedPlace.longitude).toFixed(6)}
                  )
              </p>
            )}
          </div>

          {/* 테마 선택 드롭다운 */}
          <div className="mb-2">
            <label className="block mb-1 font-medium text-gray-700">
              테마 선택
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- 테마 선택 --</option>
              <option value="카페 투어">카페 투어</option>
              <option value="산책 코스">산책 코스</option>
              <option value="문화 체험">문화 체험</option>
              <option value="사진 촬영">사진 촬영</option>
            </select>
          </div>

          {/* AI 일정 생성 버튼 */}
          <button
            onClick={handleGenerateLocationPlan}
            className="w-full bg-indigo-500 text-white py-1 rounded text-sm disabled:opacity-50"
            disabled={loadingLocationPlan}
          >
            {loadingLocationPlan ? "생성 중..." : "위치 기반 일정 생성"}
          </button>

          {/* 생성된 Markdown 미리보기 */}
          {locationPlan && (
            <div className="mt-2 text-xs text-gray-700 max-h-48 overflow-auto border rounded p-2 bg-white">
              <h4 className="font-semibold mb-1 text-indigo-700">📋 생성된 일정</h4>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {locationPlan}
              </ReactMarkdown>
            </div>
          )}

          {/* AI 위치 기반 일정 저장 버튼 */}
          {locationPlan && (
            <button
              onClick={handleApplyLocationPlan}
              className="mt-2 w-full bg-green-500 text-white py-1 rounded text-sm"
            >
              AI 일정 저장
            </button>
          )}
        </div>

        {/* E) 기존 감정 중심 AI 플랜 생성 섹션 (변경 없음) */}
        <div className="mt-2 space-y-2 text-sm border-t pt-4">
          <h3 className="font-medium mb-2 text-gray-700">감정 중심 AI 플랜</h3>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border p-1 rounded text-xs"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border p-1 rounded text-xs"
          />
          <input
            type="text"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            placeholder="감정"
            className="w-full border p-1 rounded text-xs"
          />
          <input
            type="text"
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            placeholder="활동 (콤마 구분)"
            className="w-full border p-1 rounded text-xs"
          />
          <input
            type="text"
            value={requiredKeywords}
            onChange={(e) => setRequiredKeywords(e.target.value)}
            placeholder="필수 키워드 (콤마 구분)"
            className="w-full border p-1 rounded text-xs"
          />
          <button
            onClick={handleGenerateAiPlan}
            className="w-full bg-indigo-500 text-white py-1 rounded text-xs"
          >
            AI 플랜 생성
          </button>
          {plan && (
            <button
              onClick={handleApplyAiPlan}
              className="w-full bg-green-500 text-white py-1 rounded text-xs"
            >
              스케줄 반영
            </button>
          )}
          {plan && (
            <button
              onClick={handleGenerateAiPlan}
              disabled={loading}
              className="w-full bg-yellow-500 text-white py-1 rounded text-xs disabled:opacity-50"
            >
              재생성
            </button>
          )}
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────────────────
          가운데: 지도(MapView)
         ──────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex">
        <div className="w-3/4 h-full">
          <MapView
            onPlaceSelect={handlePlaceSelect}
            onCreateScheduleFromPlace={handleCreateScheduleFromPlace}
          />
        </div>

        {/* ────────────────────────────────────────────────────────────────────
            오른쪽: 등록된 일정 목록 + AI가 만든 마크다운 플랜 미리보기
           ──────────────────────────────────────────────────────────────────── */}
        <div className="w-1/4 h-full overflow-y-auto bg-white shadow p-4">
          <Link to="/scheduler" className="text-lg font-semibold mb-3 block">
            🗓 등록된 일정
          </Link>
          <PlannerList
            events={events}
            onEdit={(evt) => {
              setSelectedEvent(evt);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
          />

          {/* 기존 감정 중심 AI 플랜의 Markdown 미리보기 */}
          {plan && (
            <div className="mt-4 text-sm text-gray-700 max-h-60 overflow-auto border rounded p-2 bg-white">
              <h3 className="font-bold mb-2 text-indigo-700">📋 생성된 플랜</h3>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          하단: 일정 수정/메모 모달 (MemoSection 컴포넌트)
         ──────────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <MemoSection
          event={selectedEvent}
          onSave={handleSaveFromModal}
          onDelete={handleDelete}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MapPage;