import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function FindPasswordPage() {
  const [method, setMethod] = useState('phone'); // 'phone' or 'email'
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [verified, setVerified] = useState(false);

  const handleSendCode = () => {
    if ((method === 'phone' && phone) || (method === 'email' && email)) {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(generated);
      alert(`인증번호 발송됨: ${generated}`);
    }
  };

  const handleVerify = () => {
    if (code === sentCode) {
      setVerified(true);
      alert("인증 성공! 비밀번호 재설정 페이지로 이동합니다.");
      // TODO: 비밀번호 재설정 페이지로 navigate
    } else {
      alert("인증번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow mt-10">
      <Link to="/" className="text-2xl font-bold text-blue-600 mb-6 block text-center">
        Emotion Planner
      </Link>
      {/* 탭 */}
      <div className="flex justify-center gap-6 mb-6">
        <button
          className={`font-bold ${method === 'phone' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => setMethod('phone')}
        >
          휴대전화 인증
        </button>
        <button
          className={`font-bold ${method === 'email' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => setMethod('email')}
        >
          이메일 인증
        </button>
      </div>

      {/* 사용자 ID 입력 */}
      <input
        type="text"
        placeholder="아이디"
        className="w-full p-2 border rounded mb-4"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      {/* 방식별 입력 */}
      {method === 'phone' ? (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="휴대전화번호"
            className="flex-1 p-2 border rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={handleSendCode}
            disabled={!phone}
            className={`px-4 py-2 rounded text-white ${phone ? 'bg-green-500' : 'bg-gray-400'}`}
          >
            인증번호 받기
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            placeholder="이메일"
            className="flex-1 p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleSendCode}
            disabled={!email}
            className={`px-4 py-2 rounded text-white ${email ? 'bg-green-500' : 'bg-gray-400'}`}
          >
            인증번호 받기
          </button>
        </div>
      )}

      {/* 인증번호 입력 */}
      <input
        type="text"
        placeholder="인증번호 6자리 입력"
        className="w-full p-2 border rounded mb-6"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button
        onClick={handleVerify}
        disabled={code.length !== 6}
        className={`w-full py-2 rounded text-white ${code.length === 6 ? 'bg-blue-500' : 'bg-gray-400'}`}
      >
        비밀번호 재설정
      </button>
    </div>
  );
}