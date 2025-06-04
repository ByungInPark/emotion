import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const CalendarPanel = ({ initialDate }) => {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      initialDate={initialDate}  // ✅ 여기 추가해야 함
      editable={true}
      selectable={true}
      height="auto"
    />
  );
};

export default CalendarPanel;