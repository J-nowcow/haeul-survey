'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface PatientInfo {
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  phone: string;
}

export default function Home() {
  const router = useRouter();
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    birthDate: '',
    gender: 'female',
    phone: '010-',
  });

  const handleSubmit = () => {
    if (!patientInfo.name.trim()) {
      alert('성함을 입력해주세요.');
      return;
    }
    sessionStorage.setItem('patientInfo', JSON.stringify(patientInfo));
    router.push('/survey');
  };

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-haeul-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-haeul-800 mb-2">해울한의원</h1>
          <p className="text-haeul-600 font-medium">자가 건강 진단 시스템</p>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-haeul-800 mb-1.5 ml-1">성함</label>
            <input
              type="text"
              value={patientInfo.name}
              onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
              placeholder="홍길동"
              className="w-full p-4 bg-haeul-50 border border-haeul-200 rounded-2xl focus:outline-none focus:border-haeul-800 focus:ring-1 focus:ring-haeul-800 transition-all text-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-haeul-800 mb-1.5 ml-1">생년월일</label>
              <input
                type="text"
                value={patientInfo.birthDate}
                onChange={(e) => setPatientInfo({ ...patientInfo, birthDate: e.target.value.replace(/\D/g, '') })}
                placeholder="800101"
                maxLength={6}
                inputMode="numeric"
                className="w-full p-4 bg-haeul-50 border border-haeul-200 rounded-2xl focus:outline-none focus:border-haeul-800 focus:ring-1 focus:ring-haeul-800 transition-all text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-haeul-800 mb-1.5 ml-1">성별</label>
              <select
                value={patientInfo.gender}
                onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value as 'male' | 'female' })}
                className="w-full p-4 bg-haeul-50 border border-haeul-200 rounded-2xl focus:outline-none focus:border-haeul-800 focus:ring-1 focus:ring-haeul-800 transition-all text-lg"
              >
                <option value="female">여성</option>
                <option value="male">남성</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-haeul-800 mb-1.5 ml-1">연락처</label>
            <input
              type="text"
              value={patientInfo.phone}
              onChange={(e) => {
                // 숫자만 추출
                const digits = e.target.value.replace(/\D/g, '');
                // 010으로 시작하지 않으면 010 추가
                const normalized = digits.startsWith('010') ? digits : '010' + digits.replace(/^010/, '');
                // 최대 11자리까지만
                const limited = normalized.slice(0, 11);
                // 자동 대시 삽입 (010-1234-5678 형식)
                let formatted = '';
                if (limited.length <= 3) {
                  formatted = limited;
                } else if (limited.length <= 7) {
                  formatted = `${limited.slice(0, 3)}-${limited.slice(3)}`;
                } else {
                  formatted = `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
                }
                setPatientInfo({ ...patientInfo, phone: formatted });
              }}
              placeholder="010-1234-5678"
              maxLength={13}
              inputMode="numeric"
              className="w-full p-4 bg-haeul-50 border border-haeul-200 rounded-2xl focus:outline-none focus:border-haeul-800 focus:ring-1 focus:ring-haeul-800 transition-all text-lg"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="btn-press w-full mt-6 py-4 bg-haeul-800 text-white rounded-2xl font-bold text-lg hover:bg-haeul-900 shadow-lg flex items-center justify-center gap-2"
          >
            진단 시작하기 <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
