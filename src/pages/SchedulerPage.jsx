import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ScheduleModal from "@/components/ScheduleModal";
import PlannerList from "@/components/PlannerList";
import ScheduleForm from "@/components/ScheduleForm";
import { PRIORITY_COLORS } from "@/constants";
import axiosInstance from "@/api/axiosInstance";

const SchedulerPage = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  // 1) URL 쿼리스트링에서 selected 값을 읽는다
  const [searchParams] = useSearchParams();
  const selectedSchedulerId = searchParams.get("selected");

  // 2) 일정, 모달 관련 상태
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // 3) “선택된 스케줄러ID”가 없으면 관리 페이지로 리다이렉트
  useEffect(() => {
    if (!selectedSchedulerId) {
      alert("먼저 스케줄러를 관리 화면에서 선택하거나 생성해 주세요.");
      navigate("/manage-schedulers");
    }
  }, [selectedSchedulerId, navigate]);

  // 4) 선택된 스케줄러 ID 변경 시 → 해당 스케줄러의 일정 목록을 가져온다
  useEffect(() => {
    if (!selectedSchedulerId) return;
    fetchSchedules(selectedSchedulerId);
  }, [selectedSchedulerId]);

  const fetchSchedules = async (schedulerId) => {
    try {
      // 백엔드에서 “/api/schedulers/{id}/schedules”로 일정 리스트를 가져온다
      const res = await axiosInstance.get(`/schedulers/${schedulerId}/schedules`);
      const mapped = res.data.map((item) => {
        const key = item.priority.trim();
        const color = PRIORITY_COLORS[key] || "#999";
        return {
          id: item.id.toString(),
          title: item.title,
          start: item.start,
          end: item.end,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            memo: item.memo,
            location: item.location,
            emotion: item.emotion,
            priority: item.priority,
          },
        };
      });
      setEvents(mapped);
    } catch (err) {
      console.error("일정 불러오기 실패:", err);
      alert("일정을 불러오는 데 실패했습니다.");
    }
  };

  // 5) 새로운 일정 생성 (슬라이드 패널 → ScheduleForm)
  const addSchedule = async ({ title, start, end, priority, location, memo, tag }) => {
    try {
      const payload = {
        title,
        start,
        end,
        priority,
        location,
        memo,
        emotion: "",       // 필요하다면 감정 필드도 전달
        scheduler_id: selectedSchedulerId,
      };
      const res = await axiosInstance.post("/schedules", payload);
      const saved = res.data;
      const key = saved.priority.trim();
      const color = PRIORITY_COLORS[key] || "#999";
      setEvents((prev) => [
        ...prev,
        {
          id: saved.id.toString(),
          title: saved.title,
          start: saved.start,
          end: saved.end,
          backgroundColor: color,
          borderColor: color,
          extendedProps: { memo: saved.memo, location: saved.location },
        },
      ]);
      setIsPanelOpen(false);
    } catch (err) {
      console.error("일정 저장 실패:", err);
      alert("일정 생성에 실패했습니다.");
    }
  };

  // 6) FullCalendar의 날짜 클릭 → 모달 오픈
  const handleDateClick = (arg) => {
    setSelectedEvent({
      id: null,
      title: "",
      start: arg.dateStr,
      end: arg.dateStr,
      emotion: "",
      priority: "보통",
      location: "",
      tag: "",
      memo: "",
    });
    setIsModalOpen(true);
  };

  // 7) FullCalendar의 이벤트 클릭 → 수정 모달 오픈
  const handleEventClick = (clickInfo) => {
    const ev = clickInfo.event;
    setSelectedEvent({
      id: ev.id,
      title: ev.title,
      start: ev.startStr,
      end: ev.endStr,
      emotion: ev.extendedProps.emotion || "",
      priority: ev.extendedProps.priority || "보통",
      location: ev.extendedProps.location || "",
      tag: ev.extendedProps.tag || "",
      memo: ev.extendedProps.memo || "",
    });
    setIsModalOpen(true);
  };

  // 8) 모달 저장 버튼을 누르면 호출되는 콜백
  const handleSave = (savedEvent) => {
    // 모달에서 이미 백엔드에 저장/수정이 완료된 상태라고 가정 → 받은 savedEvent로 화면 갱신
    const key = savedEvent.priority.trim();
    const color = PRIORITY_COLORS[key] || "#999";
    const eventWithColor = {
      id: savedEvent.id.toString(),
      title: savedEvent.title,
      start: savedEvent.start,
      end: savedEvent.end,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { memo: savedEvent.memo, location: savedEvent.location },
    };

    setEvents((prev) => {
      // 이미 로컬 state에 있으면 수정, 없으면 새로 추가
      if (savedEvent.id && prev.some((e) => e.id === eventWithColor.id)) {
        return prev.map((e) => (e.id === eventWithColor.id ? eventWithColor : e));
      } else {
        return [...prev, eventWithColor];
      }
    });

    setIsModalOpen(false);
  };

  // 9) 모달 삭제 버튼을 누르면 호출되는 콜백
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/schedules/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id.toString()));
      setIsModalOpen(false);
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* — Header: 홈 버튼 + “스케줄러 관리” 이동 링크 — */}
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <Link to="/" className="text-2xl font-bold text-green-600 hover:underline">
          Emotion Planner
        </Link>
        <Link
          to="/manage-schedulers"
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          스케줄러 관리
        </Link>
      </div>

      {/* — 달력 영역 — */}
      <div className="flex justify-center items-center p-4">
        <div className="w-full max-w-6xl">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            selectable={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            events={events}
            height="auto"
            headerToolbar={{
              start: "prev,next today",
              center: "title",
              end: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
          />
        </div>
      </div>

      {/* — 우측 슬라이드 패널: 일정 추가 / 목록 보기 — */}
      {isPanelOpen && (
        <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl z-50 p-6 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">📋 일정 추가 / 목록</h2>
            <button onClick={() => setIsPanelOpen(false)} className="text-red-500">
              닫기
            </button>
          </div>
          <div className="mt-6">
            <ScheduleForm onAddEvent={addSchedule} onCancel={() => setIsPanelOpen(false)} />
            <div className="mt-6">
              <PlannerList events={events} onEdit={setSelectedEvent} onDelete={handleDelete} />
            </div>
          </div>
        </div>
      )}

      {/* — 일정 추가/수정 모달 — */}
      {isModalOpen && (
        <ScheduleModal
          event={selectedEvent}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setIsModalOpen(false)}
          schedulerId={selectedSchedulerId}
        />
      )}

      {/* — Fixed 위치에 “일정 추가” 버튼을 띄워서 슬라이드 패널 열기 — */}
      <button
        onClick={() => setIsPanelOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-500 text-white rounded-full w-14 h-14 shadow-lg hover:bg-blue-600 flex items-center justify-center"
      >
        ＋
      </button>
    </div>
  );
};

export default SchedulerPage;