import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { register } from '../api/auth';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    recovery_email:'',
    password: '',
    confirmPw: '',
    birth: '',
    agree: false,
  });

  const [idChecked, setIdChecked] = useState(false);
  const [idError, setIdError] = useState('');
  const [pwError, setPwError] = useState('');

  const navigate = useNavigate();

  // ID 중복 확인 (더미 예제)
  const handleCheckId = () => {
    if (!formData.username.trim()) {
      setIdChecked(false);
      setIdError('아이디를 입력해주세요.');
      return;
    }
  
    // 실제 중복 확인 로직은 아래와 같이 더미로 처리
    if (formData.username === 'testuser') {
      setIdChecked(false);
      setIdError('이미 사용 중인 아이디입니다.');
    } else {
      setIdChecked(true);
      setIdError('사용 가능한 아이디입니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // 비밀번호 확인 실시간 체크
    if (name === 'confirmPw' || name === 'pw') {
      setPwError(
        name === 'confirmPw' && value !== formData.password
          ? '비밀번호가 일치하지 않습니다.'
          : ''
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (!formData.agree) {
      alert("약관에 동의해주세요!");
      return;
    }
  
    if (!idChecked) {
      alert("아이디 중복 확인을 해주세요!");
      return;
    }
  
    if (formData.password !== formData.confirmPw) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }
  
    try {
      // ✅ 실제 백엔드에 회원가입 요청
      await register(
        formData.username,
        formData.email,
        formData.recovery_email,
        formData.password,
        formData.name,
        formData.birth
      );
      alert(`${formData.name}님, 가입을 환영합니다!`);
      navigate('/login');
    } catch (err) {
      console.error("회원가입 오류:", err);
      alert("회원가입 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white-50 to-white">
      <div className="w-full max-w-md p-10 bg-white border border-gray-500 rounded-3xl space-y-6">
        <Link to="/" className="text-3xl font-extrabold text-center text-blue-600">Emotion Planner</Link>
        <p className="text-sm text-center text-gray-500 mb-4">아래 정보를 입력해주세요</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="이름 / 닉네임"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <div className="flex space-x-2">
            <input
              type="text"
              name="email"
              placeholder="아이디 (로그인용)"
              value={formData.email}
              onChange={handleChange}
              className="flex-1 p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
            <button
              type="button"
              onClick={handleCheckId}
              className="px-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
            >
              중복 확인
            </button>
          </div>
          {idError && (
            <p className={`text-sm ${idChecked ? 'text-blue-500' : 'text-red-500'}`}>{idError}</p>
          )}

          <input
            type="email"
            name="recovery_email"
            placeholder="이메일 (계정 복구용)"
            value={formData.recovery_email}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="비밀번호 (6자 이상)"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="password"
            name="confirmPw"
            placeholder="비밀번호 확인"
            value={formData.confirmPw}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}

          <input
            type="text"
            name="birth"
            placeholder="생년월일 (예: 2000-01-01)"
            value={formData.birth}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              className="mr-2"
            />
            <span>
              <a href="/terms" target="_blank" className="text-blue-500 underline mr-1">
                이용 약관
              </a>
              에 동의합니다
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-3 rounded-xl text-lg font-semibold hover:bg-purple-600 transition"
          >
            회원가입
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full text-sm text-center text-blue-500 hover:underline"
          >
            로그인하러 가기 →
          </button>
        </form>
      </div>
    </div>
  );
};


export default RegisterPage;