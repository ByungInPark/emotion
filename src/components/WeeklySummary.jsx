import React from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

const WeeklySummary = ({ events }) => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });

  const weekEvents = events.filter(event => {
    const eventDate = parseISO(event.start);
    return isWithinInterval(eventDate, { start, end });
  });

  const priorities = weekEvents.reduce(
    (acc, event) => {
      const priority = event.priority || '보통';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📈 주간 요약</h2>
      <p className="mb-2 text-gray-700">
        {format(start, 'MM/dd')} ~ {format(end, 'MM/dd')} 동안 총 <strong>{weekEvents.length}</strong>개의 일정이 있습니다.
      </p>
      <ul className="list-disc pl-6 text-sm text-gray-600">
        {Object.entries(priorities).map(([key, count]) => (
          <li key={key}>{key} 우선순위: {count}개</li>
        ))}
      </ul>
    </div>
  );
};

export default WeeklySummary;