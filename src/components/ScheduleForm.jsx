import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import TagSelector from './TagSelector';

export default function ScheduleForm({ onAddEvent, onCancel, schedulerId }) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [priority, setPriority] = useState('보통');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [tag, setTag] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // Payload for backend
    const payload = { title, start, end, priority, location, memo, tag, scheduler_id: schedulerId, };

    try {
      const res = await axiosInstance.post('/schedules', payload);
      const saved = res.data;
      onAddEvent({ title, start, end, priority, location, memo, tag });
      // reset form
      setTitle('');
      setStart('');
      setEnd('');
      setPriority('보통');
      setLocation('');
      setMemo('');
      setTag('');
    } catch (err) {
      console.error('일정 생성 실패', err);
      const msg = err.response?.data?.detail || err.message;
      alert(`일정 생성에 실패했습니다:\n${msg}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">제목</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="일정 제목"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">시작 시간</label>
        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={start}
          onChange={e => setStart(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">종료 시간</label>
        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={end}
          onChange={e => setEnd(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">우선순위</label>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="보통">보통</option>
          <option value="중요">중요</option>
          <option value="매우 중요">매우 중요</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">장소</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="예: 카페, 도서관..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium">메모</label>
        <textarea
          className="w-full border p-2 rounded"
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="간단한 메모"
        />
      </div>

      <TagSelector tag={tag} setTag={setTag} />

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >취소</button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >저장</button>
      </div>
    </form>
  );
}
