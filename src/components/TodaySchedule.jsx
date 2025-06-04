import React from "react";

const TodaySchedule = ({ events }) => {
  const today = new Date();
  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.start);
    return (
      eventDate.getFullYear() === today.getFullYear() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getDate() === today.getDate()
    );
  });

  const sortedEvents = [...todayEvents].sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className="p-4 bg-white rounded shadow mt-6">
      <h2 className="text-lg font-bold mb-4">
        📅 오늘 스케줄 ({today.toLocaleDateString()})
      </h2>
      {sortedEvents.length > 0 ? (
        <ul className="space-y-2">
          {sortedEvents.map((event, idx) => (
            <li key={idx} className="border-b pb-2">
              {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.title}
            </li>
          ))}
        </ul>
      ) : (
        <p>오늘 등록된 스케줄이 없습니다.</p>
      )}
    </div>
  );
};

export default TodaySchedule;