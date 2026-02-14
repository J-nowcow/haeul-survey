'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // 쿠키 기반 인증 확인
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 관리자 통계 API 호출해서 인증 확인
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        setIsAuthenticated(true);
        router.push('/admin/dashboard');
      }
    } catch {
      // 인증 실패 시 로그인 폼 표시
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch {
      setError('서버 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--haeul-800)]"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-[var(--haeul-800)]">
            관리자 로그인
          </h1>
          <p className="text-[var(--haeul-600)] mt-2">
            해울한의원 설문 관리 시스템
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--haeul-800)] transition"
              placeholder="관리자 비밀번호 입력"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button type="submit" className="w-full py-3 px-6 rounded-xl font-semibold bg-[var(--haeul-800)] text-white hover:bg-[var(--haeul-900)] transition">
            로그인
          </button>
        </form>

        <p className="text-center text-sm text-[var(--haeul-600)] mt-6">
          <a href="/" className="hover:underline">← 설문 페이지로 돌아가기</a>
        </p>
      </div>
    </main>
  );
}
