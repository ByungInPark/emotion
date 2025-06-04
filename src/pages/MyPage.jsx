import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from "react-router-dom";

export default function MyPage() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    birth: user?.birth || '',
    password: '',
  });

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) return <div>로딩 중이거나 로그인되지 않았습니다.</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setEditing((prev) => !prev);
    setMessage('');
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        username: form.username,
        name: form.name,
        birth: form.birth,
      };

      // 비밀번호 입력된 경우만 포함
      if (form.password.trim() !== '') {
        payload.password = form.password;
      }

      const res = await axios.patch(
        'http://localhost:8001/api/users/me',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(res.data);
      setEditing(false);
      setForm((prev) => ({ ...prev, password: '' })); // 비밀번호 필드 초기화
      setMessage('✅ 프로필이 성공적으로 수정되었습니다.');
    } catch (err) {
      console.error('❌ 프로필 수정 실패:', err);
      setMessage('❌ 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <Link to="/" className="text-3xl font-bold text-center text-purple-700 mb-6">
            Emotion Planner
        </Link>

        <div className="space-y-4 text-gray-700">
          <div>
            <label className="font-semibold">이메일 (아이디)</label>
            <input
              type="text"
              value={user.email}
              readOnly
              className="w-full bg-gray-200 p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="font-semibold">이름</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={!editing}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="font-semibold">닉네임</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={!editing}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="font-semibold">생년월일</label>
            <input
              name="birth"
              value={form.birth}
              onChange={handleChange}
              disabled={!editing}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          {editing && (
            <div>
              <label className="font-semibold">새 비밀번호</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              />
              <p className="text-sm text-gray-500">※ 입력 시 비밀번호가 변경됩니다.</p>
            </div>
          )}
        </div>

        {message && <p className="text-sm mt-3 text-center text-green-600">{message}</p>}

        <div className="flex justify-between mt-6">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mr-2"
              >
                저장
              </button>
              <button
                onClick={handleEditToggle}
                className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded"
              >
                취소
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded"
            >
              프로필 수정
            </button>
          )}
        </div>

        <button
          onClick={logout}
          className="mt-4 w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}