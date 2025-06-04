import React, { useEffect, useState } from 'react';
import { fetchMyInfo } from '../api/auth';

const UserProfile = () => {
  const [user, setUser] = useState(null); // 사용자 정보 상태

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfo = await fetchMyInfo(); // ✅ 토큰을 이용해 사용자 정보 요청
        setUser(userInfo);
      } catch (err) {
        console.error("사용자 정보 불러오기 실패:", err);
      }
    };

    loadUser();
  }, []);

  if (!user) return <div>로딩 중...</div>;

  return (
    <div className="p-4 bg-white border rounded-xl shadow">
      <h2 className="text-xl font-bold">👤 내 정보</h2>
      <p>아이디: {user.username}</p>
      <p>이름: {user.name}</p>
      <p>이메일: {user.email}</p>
      <p>생년월일: {user.birth}</p>
    </div>
  );
};

export default UserProfile;