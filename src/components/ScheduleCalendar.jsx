import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';
import ScheduleModal from './ScheduleModal';
import { PRIORITY_COLORS } from '../constants';

const ScheduleCalendar = ({ events, setEvents }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateSelect = (selectInfo) => {
    setSelectedEvent({
      id: null,
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      priority: '보통',
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      priority: event.extendedProps.priority || '보통',
    });
    setIsModalOpen(true);
  };

  const handleEventSave = (newEvent) => {
    const color = PRIORITY_COLORS[newEvent.priority] || "gray";

    const eventWithColor = {
      ...newEvent,
      id: newEvent.id || Date.now().toString(),
      backgroundColor: color,
      borderColor: color,
      title: newEvent.title || '스케줄',
    };

    if (newEvent.id) {
      setEvents((prev) =>
        prev.map((evt) => (evt.id === newEvent.id ? eventWithColor : evt))
      );
    } else {
      setEvents((prev) => [...prev, eventWithColor]);
    }

    setIsModalOpen(false);
  };

  const handleEventDelete = (id) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        editable={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        slotDuration="00:30:00"
      />

      {isModalOpen && (
        <ScheduleModal
          event={selectedEvent}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ScheduleCalendar;