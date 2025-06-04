import React, { useState } from 'react';

const PlannerForm = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [emotion, setEmotion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date || !emotion) return;
    onAdd({ title, date, emotion });
    setTitle('');
    setDate('');
    setEmotion('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input className="w-full p-2 border" placeholder="일정 제목" value={title} onChange={e => setTitle(e.target.value)} />
      <input className="w-full p-2 border" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <input className="w-full p-2 border" placeholder="감정 (예: 행복, 우울)" value={emotion} onChange={e => setEmotion(e.target.value)} />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">일정 추가</button>
    </form>
  );
};

export default PlannerForm;