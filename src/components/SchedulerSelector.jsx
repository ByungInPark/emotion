import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const SchedulerSelector = ({ currentSchedulerId, setSchedulerId }) => {
  const [schedulers, setSchedulers] = useState([]);

  useEffect(() => {
    axiosInstance.get("/api/schedulers").then((res) => {
      setSchedulers(res.data);
    });
  }, []);

  return (
    <select
      value={currentSchedulerId || ""}
      onChange={(e) => setSchedulerId(e.target.value)}
    >
      <option value="">스케줄러 선택</option>
      {schedulers.map((scheduler) => (
        <option key={scheduler.id} value={scheduler.id}>
          {scheduler.name}
        </option>
      ))}
    </select>
  );
};

export default SchedulerSelector;