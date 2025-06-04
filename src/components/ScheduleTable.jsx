import moment from 'moment';
import { useState } from 'react';

const localizer = momentLocalizer(moment);

const ScheduleTable = () => {
  const [events, setEvents] = useState([
    {
      title: '예시 일정',
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1시간 후
    },
  ]);

  const handleSelectSlot = ({ start, end }) => {
    const title = prompt('일정 제목을 입력하세요');
    if (title) {
      setEvents([...events, { start, end, title }]);
    }
  };

  return (
    <div className="h-[700px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        selectable
        onSelectSlot={handleSelectSlot}
        style={{ height: '100%' }}
        views={['week']}
        messages={{ week: '주간' }}
      />
    </div>
  );
};

export default ScheduleTable;