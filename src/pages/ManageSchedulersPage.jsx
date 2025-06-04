import React, { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";

export default function ManageSchedulersPage() {
  const [newName, setNewName] = useState("");
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  // 1) 스케줄러 목록 불러오기
  const fetchList = async () => {
    try {
      const res = await axiosInstance.get("/schedulers");
      setList(res.data);
    } catch (err) {
      console.error("스케줄러 목록 불러오기 실패:", err);
      alert("스케줄러 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 2) 새 스케줄러 생성
  const handleCreate = async () => {
    if (!newName.trim()) {
      alert("스케줄러 이름을 입력하세요.");
      return;
    }
    try {
      await axiosInstance.post("/schedulers", { name: newName.trim() });
      setNewName("");
      fetchList(); // 생성 후 목록 갱신
    } catch (err) {
      console.error("스케줄러 생성 실패:", err);
      alert("스케줄러 생성에 실패했습니다.");
    }
  };

  // 3) 스케줄러 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axiosInstance.delete(`/schedulers/${id}`);
      fetchList();
    } catch (err) {
      console.error("스케줄러 삭제 실패:", err);
      alert("스케줄러 삭제에 실패했습니다.");
    }
  };

  // 4) 해당 스케줄러 선택 → /scheduler?selected=<id> 로 이동
  const handleSelect = (id) => {
    navigate(`/scheduler?selected=${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/" className="text-2xl font-bold text-green-600 hover:underline">
        Emotion Planner
      </Link>

      {/* 새 스케줄러 생성 폼 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
          placeholder="새 스케줄러 이름"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          생성
        </button>
      </div>

      {/* 스케줄러 목록 */}
      {list.length === 0 ? (
        <p className="text-gray-500">아직 생성된 스케줄러가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center border rounded-lg p-3"
            >
              <span className="font-medium">{item.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSelect(item.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  이동
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}