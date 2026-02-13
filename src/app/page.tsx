'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PatientInfo {
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | '';
  phoneLast4: string;
}

interface FormErrors {
  name?: string;
  birthDate?: string;
  gender?: string;
  phoneLast4?: string;
}

export default function Home() {
  const router = useRouter();
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    birthDate: '',
    gender: '',
    phoneLast4: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = () => {
    const newErrors: FormErrors = {};
    
    if (!patientInfo.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }
    
    if (!patientInfo.birthDate || patientInfo.birthDate.length !== 6) {
      newErrors.birthDate = '생년월일 6자리를 입력해주세요 (예: 800101)';
    }
    
    if (!patientInfo.gender) {
      newErrors.gender = '성별을 선택해주세요';
    }
    
    if (!patientInfo.phoneLast4 || patientInfo.phoneLast4.length !== 4) {
      newErrors.phoneLast4 = '연락처 뒤 4자리를 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // 세션 스토리지에 환자 정보 저장
      sessionStorage.setItem('patientInfo', JSON.stringify(patientInfo));
      router.push('/survey');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="text-6xl mb-4">🏥</div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-2">
            해울한의원
          </h1>
          <p className="text-[var(--color-text-light)]">
            자가진단 설문조사
          </p>
        </div>

        {/* 환자 정보 입력 폼 */}
        <form onSubmit={handleSubmit} className="card animate-slideIn">
          <h2 className="text-lg font-semibold mb-6 text-center">
            환자 정보를 입력해주세요
          </h2>

          {/* 이름 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">이름</label>
            <input
              type="text"
              value={patientInfo.name}
              onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition"
              placeholder="홍길동"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 생년월일 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">생년월일 (6자리)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={patientInfo.birthDate}
              onChange={(e) => setPatientInfo({ ...patientInfo, birthDate: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition"
              placeholder="800101"
            />
            {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
          </div>

          {/* 성별 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">성별</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPatientInfo({ ...patientInfo, gender: 'male' })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition font-medium ${
                  patientInfo.gender === 'male'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                    : 'border-gray-300 bg-white hover:border-[var(--color-primary-light)]'
                }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setPatientInfo({ ...patientInfo, gender: 'female' })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition font-medium ${
                  patientInfo.gender === 'female'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                    : 'border-gray-300 bg-white hover:border-[var(--color-primary-light)]'
                }`}
              >
                여성
              </button>
            </div>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>

          {/* 연락처 뒤 4자리 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">연락처 뒤 4자리</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={patientInfo.phoneLast4}
              onChange={(e) => setPatientInfo({ ...patientInfo, phoneLast4: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition"
              placeholder="1234"
            />
            {errors.phoneLast4 && <p className="text-red-500 text-sm mt-1">{errors.phoneLast4}</p>}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="w-full btn btn-primary text-lg"
          >
            설문 시작하기
          </button>
        </form>

        {/* 안내 문구 */}
        <p className="text-center text-sm text-[var(--color-text-light)] mt-6">
          설문은 약 5~10분 정도 소요됩니다
        </p>
      </div>
    </main>
  );
}
