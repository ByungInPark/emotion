import React, { useEffect, useState } from 'react';

const ViewPage = () => {
  // 임시로 로컬스토리지에서 일정 목록을 불러온다고 가정
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('plans');
    if (stored) {
      setPlans(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 내 일정 목록</h1>
      {plans.length === 0 ? (
        <p className="text-gray-500">저장된 일정이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {plans.map((plan, index) => (
            <li key={index} className="border p-4 rounded shadow-sm bg-white">
              <h2 className="text-lg font-semibold">{plan.title}</h2>
              <p className="text-gray-700 mt-2">{plan.memo}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewPage;