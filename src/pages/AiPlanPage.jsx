import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

export default function AiPlanPage() {
  const navigate = useNavigate();

  // ──────────────────────────────────────────────────────────────────────────
  // 1) 스케줄러 목록을 백엔드에서 가져와 드롭다운에 뿌리고 선택 상태 관리
  // ──────────────────────────────────────────────────────────────────────────
  const [schedulers, setSchedulers] = useState([]);
  const [selectedSchedulerId, setSelectedSchedulerId] = useState(null);

  useEffect(() => {
    async function loadSchedulers() {
      try {
        const res = await axiosInstance.get("/schedulers");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSchedulers(res.data);
          // 첫 번째 스케줄러를 기본 선택 (없으면 null 상태 유지)
          setSelectedSchedulerId(res.data[0].id);
        }
      } catch (err) {
        console.error("스케줄러 목록 로드 실패:", err);
      }
    }
    loadSchedulers();
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // 2) AI 플랜 생성에 필요한 입력값들
  // ──────────────────────────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState("");            // 여행 시작일
  const [endDate, setEndDate] = useState("");                // 여행 종료일
  const [emotion, setEmotion] = useState("");                // 감정 중심 (optional)
  const [activities, setActivities] = useState("");          // 활동 리스트 (comma-separated)
  const [requiredKeywords, setRequiredKeywords] = useState(""); // 필수 키워드 (comma-separated)
  const [plan, setPlan] = useState("");                      // 마크다운 형태의 AI 플랜
  const [loading, setLoading] = useState(false);             // 요청 중 로딩 상태

  // ──────────────────────────────────────────────────────────────────────────
  // 3) “AI 플랜 생성” 버튼 클릭 시 백엔드 `/ai/plan` 호출
  // ──────────────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      alert("날짜를 먼저 선택해 주세요.");
      return;
    }
    if (!requiredKeywords.trim()) {
      alert("필수 키워드를 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const resp = await axiosInstance.post("/ai/plan", {
        start_date: startDate,
        end_date: endDate,
        emotion_focus: emotion.trim(),
        activity_types: activities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        required_keywords: requiredKeywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setPlan(resp.data.plan || "");
    } catch (err) {
      console.error("AI 플랜 생성 오류:", err);
      alert("플랜 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 재생성 버튼 (handleGenerate 재호출)
  const handleRegenerate = () => {
    handleGenerate();
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 4) “스케줄러에 반영” 버튼 클릭 시,
  //    - 먼저 plan (마크다운)에서 표형식 일정을 파싱
  //    - 반드시 scheduler_id를 포함해서 `/schedules`에 POST
  // ──────────────────────────────────────────────────────────────────────────
  const handleApplyToScheduler = async () => {
    if (!plan) {
      alert("먼저 AI 플랜을 생성해 주세요.");
      return;
    }
    if (!selectedSchedulerId) {
      alert("먼저 스케줄러를 선택해 주세요.");
      return;
    }
    if (!window.confirm("AI 플랜을 선택한 스케줄러에 반영하시겠습니까?")) {
      return;
    }

    // “**부연 설명” 뒤에 나오는 메모 파트가 있으면 memoText로 저장
    const [planTextOnly, memoText] = plan.split("**부연 설명");

    // Markdown 표(row) 형태: | YYYY-MM-DD | HH:MM - HH:MM | 일정 제목 | … |
    const rowRegex =
      /\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([0-9]{1,2}:[0-9]{2})\s*-\s*([0-9]{1,2}:[0-9]{2})\s*\|\s*([^|]+?)\s*\|/g;

    const eventsToSave = [];
    let match;
    while ((match = rowRegex.exec(planTextOnly)) !== null) {
      const [_, date, startTime, endTime, activity] = match;
      eventsToSave.push({
        title: activity.trim(),
        start: `${date}T${startTime}`,  // ISO8601 형식으로 매칭
        end: `${date}T${endTime}`,
        emotion: "",                    // AI 플랜엔 감정 정보가 없으므로 빈 문자열
        location: "",                   // AI 플랜엔 장소 정보가 없으므로 빈 문자열
        memo: memoText ? memoText.trim() : "",
        priority: "보통",               // 기본 우선순위 “보통”
        scheduler_id: selectedSchedulerId,
      });
    }

    if (eventsToSave.length === 0) {
      alert("추출된 일정이 없습니다. AI 플랜 형식을 확인해주세요.");
      return;
    }

    try {
      // 배열을 순회하면서 각각 POST 요청
      await Promise.all(
        eventsToSave.map((evt) =>
          axiosInstance.post("/schedules", {
            title: evt.title,
            start: evt.start,
            end: evt.end,
            emotion: evt.emotion,
            location: evt.location,
            memo: evt.memo,
            priority: evt.priority,
            scheduler_id: evt.scheduler_id,
          })
        )
      );
      alert("스케줄러에 성공적으로 반영되었습니다.");
      // 저장 후 캘린더(스케줄러 페이지)로 이동
      navigate("/scheduler");
      // 이동 후 새로고침
      window.location.reload();
    } catch (err) {
      console.error("스케줄러 반영 오류:", err);
      alert("스케줄러 반영 중 오류가 발생했습니다.");
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 5) 렌더링
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* 상단 로고/홈으로가기 */}
      <Link to="/" className="text-2xl font-bold text-indigo-600 hover:underline">
        Emotion Planner
      </Link>

      {/* 페이지 제목 */}
      <h2 className="text-2xl font-bold my-4">AI 플랜 생성</h2>

      {/* ────────────────────────────────────────────────────────────────────────
         A. 스케줄러 선택 드롭다운
         ──────────────────────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          스케줄러 선택
        </label>
        <select
          value={selectedSchedulerId || ""}
          onChange={(e) => setSelectedSchedulerId(Number(e.target.value))}
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

      {/* ────────────────────────────────────────────────────────────────────────
         B. AI 플랜 생성 입력 폼
         ──────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="여행 시작일"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="여행 종료일"
        />
        <input
          type="text"
          placeholder="필수 키워드 (콤마로 구분)"
          value={requiredKeywords}
          onChange={(e) => setRequiredKeywords(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="감정 중심 (예: 스트레스 해소)"
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="활동 (콤마로 구분, 예: 산책,명상)"
          value={activities}
          onChange={(e) => setActivities(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading ? "생성 중..." : "플랜 생성"}
          </button>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="flex-1 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            재생성
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
         C. 생성된 AI 플랜 Markdown 출력 & “스케줄러에 반영” 버튼
         ──────────────────────────────────────────────────────────────────────── */}
      {plan && (
        <>
          <div className="mt-6 prose prose-sm prose-table:border prose-table:border-gray-300 prose-table:table-auto prose-table:w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => (
                  <table
                    className="min-w-full table-auto border-collapse border border-gray-300"
                    {...props}
                  />
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-gray-100" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th
                    className="border border-gray-300 px-4 py-2 text-left bg-gray-100"
                    {...props}
                  />
                ),
                tr: ({ node, ...props }) => (
                  <tr className="odd:bg-white even:bg-gray-50" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-gray-300 px-4 py-2" {...props} />
                ),
              }}
            >
              {plan}
            </ReactMarkdown>
          </div>

          <button
            onClick={handleApplyToScheduler}
            className="mt-4 w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            스케줄러에 반영
          </button>
        </>
      )}
    </div>
  );
}