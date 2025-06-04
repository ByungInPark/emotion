import React, { useState, useEffect } from 'react';
import TagSelector from './TagSelector';
import axiosInstance from '../api/axiosInstance';

const MemoSection = ({ event, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState(event.title || '');
  const [start, setStart] = useState(event.start || '');
  const [end, setEnd] = useState(event.end || '');
  const [priority, setPriority] = useState(event.priority || '보통');
  const [location, setLocation] = useState(event.location || '');
  const [memo, setMemo] = useState(event.memo || '');
  const [tag, setTag] = useState(event.tag || '');

  useEffect(() => {
    setTitle(event.title || '');
    setStart(event.start || '');
    setEnd(event.end || '');
    setPriority(event.priority || '보통');
    setLocation(event.location || '');
    setMemo(event.memo || '');
    setTag(event.tag || '');
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('로그인이 필요합니다.');

    // JSON payload
    const payload = { title, start, end, priority, location, memo, tag };

    try {
      let res;
      if (event.id) {
        res = await axiosInstance.put(`/schedules/${event.id}`, payload);
      } else {
        res = await axiosInstance.post('/schedules', payload);
      }
      onSave(res.data);
      onClose();
    } catch (err) {
      console.error('🔴 저장 실패:', err.response || err);
      const msg = err.response?.data?.detail || err.message;
      alert(`일정 저장에 실패했습니다:\n${msg}`);
    }
  };

  const handleDeleteClick = () => {
    if (event.id) onDelete(event.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-96">
        <div className="bg-blue-500 text-white text-center py-3 rounded-t-xl">
          <h2 className="text-lg font-semibold">
            {event.id ? '📌 스케줄 수정' : '📝 새 스케줄 추가'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
            <input
              type="datetime-local"
              className="w-full border p-2 rounded"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
            <input
              type="datetime-local"
              className="w-full border p-2 rounded"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
            <select
              className="w-full border p-2 rounded"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="보통">보통</option>
              <option value="중요">중요</option>
              <option value="매우 중요">매우 중요</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea
              className="w-full border p-2 rounded"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <TagSelector tag={tag} setTag={setTag} />

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >취소</button>

            {event.id && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >삭제</button>
            )}

            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemoSection;