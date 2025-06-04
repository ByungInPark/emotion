import React from "react";

const ScheduleList = ({ schedules, toggleComplete, deleteSchedule }) => {
  return (
    <div className="grid gap-4">
      {schedules.map((item, index) => (
        <div key={index} className="p-4 bg-white rounded-lg shadow-md flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleComplete(index)}
              />
              <h3 className={`text-xl font-semibold ${item.completed ? 'line-through text-gray-400' : ''}`}>
                {item.title}
              </h3>
            </div>
            <button
              onClick={() => deleteSchedule(index)}
              className="text-red-500 text-sm hover:underline"
            >
              삭제
            </button>
          </div>
          <p className="text-gray-500">{item.date}</p>
          {item.memo && <p className="text-gray-700">{item.memo}</p>}
        </div>
      ))}
    </div>
  );
};

export default ScheduleList;