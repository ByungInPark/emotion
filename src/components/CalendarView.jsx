import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarView = ({ schedules }) => {
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const found = schedules.find((item) => item.date === date.toISOString().slice(0, 10));
      return found ? <div className="text-xs text-blue-500">{found.title}</div> : null;
    }
  };

  return (
    <div className="my-8">
      <Calendar
        tileContent={tileContent}
        className="w-full border rounded-lg shadow-md"
      />
    </div>
  );
};

export default CalendarView;