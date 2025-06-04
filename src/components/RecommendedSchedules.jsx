import { useRecommendedSchedules } from "../hooks/useRecommendations";
import RecommendedSchedules from "../components/RecommendedSchedules";

const RecommendedSchedules = () => {
  const { data, isLoading } = useRecommendedSchedules();

  if (isLoading) return <p>로딩 중...</p>;

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id} className="p-2 bg-gray-200 rounded mt-2">
          {item.title} - {item.date}
        </li>
      ))}
    </ul>
  );
};

export default RecommendedSchedules;

const Schedule = () => {
    return (
      <div className="flex flex-col items-center p-6">
        <h1 className="text-2xl font-bold">📅 내 일정</h1>
        <RecommendedSchedules />
      </div>
    );
  };