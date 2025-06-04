import React from "react";
import { format } from "date-fns";
import { FaTrash, FaEdit, FaStar, FaRegStar } from "react-icons/fa";
import { PRIORITY_TEXT_COLORS } from "@/constants";

const TAG_COLORS = {
  공부: "bg-blue-100 text-blue-700",
  운동: "bg-green-100 text-green-700",
  데이트: "bg-pink-100 text-pink-700",
  약속: "bg-purple-100 text-purple-700",
  여행: "bg-yellow-100 text-yellow-700",
  기타: "bg-gray-100 text-gray-700",
};

const PlannerList = ({ events, onEdit, onDelete }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        📭 등록된 일정이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div
          key={index}
          className="bg-white border rounded-xl p-4 shadow flex flex-col md:flex-row justify-between gap-4"
        >
          {/* 왼쪽: 일정 정보 */}
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">{event.title}</h3>

              {/* ⭐ 즐겨찾기 (프론트 상태만, 저장은 생략) */}
              {event.starred ? (
                <FaStar className="text-yellow-400" />
              ) : (
                <FaRegStar className="text-gray-300" />
              )}
            </div>

            <p className="text-sm text-gray-600">
              ⏰ {format(new Date(event.start), "yyyy-MM-dd HH:mm")} ~{" "}
              {format(new Date(event.end), "HH:mm")}
            </p>

            {event.location && (
              <p className="text-sm text-gray-500">📍 {event.location}</p>
            )}

            {event.emotion && (
              <p className="text-sm">😊 감정: {event.emotion}</p>
            )}

            {event.priority && (
              <p
                className={`text-sm font-medium ${
                  PRIORITY_TEXT_COLORS[event.priority] || "text-gray-500"
                }`}
              >
                📌 우선순위: {event.priority}
              </p>
            )}

            {event.tag && (
              <span
                className={`inline-block px-2 py-1 text-xs rounded ${
                  TAG_COLORS[event.tag] || "bg-gray-100 text-gray-700"
                }`}
              >
                #{event.tag}
              </span>
            )}
          </div>

          {/* 오른쪽: 이미지 + 버튼 */}
          <div className="flex flex-col items-center gap-2">
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt="일정 이미지"
                className="w-32 h-28 object-cover rounded-xl border"
              />
            )}

            {/* 버튼 그룹 */}
            <div className="flex gap-2 pt-2">
              <button
                className="text-blue-500 hover:underline text-sm flex items-center gap-1"
                onClick={() => onEdit(event)}
              >
                <FaEdit /> 수정
              </button>
              <button
                className="text-red-500 hover:underline text-sm flex items-center gap-1"
                onClick={() => onDelete(event.id)}
              >
                <FaTrash /> 삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlannerList;