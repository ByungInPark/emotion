import ScheduleCalendar from "../components/ScheduleCalendar";

const Schedule = () => {
  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">📅 내 일정</h1>
      <ScheduleCalendar />
    </div>
  );
};

export default Schedule;