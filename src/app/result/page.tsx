'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { surveySections } from '@/lib/survey-data';

interface SurveyResult {
  id?: number;
  patientInfo: {
    name: string;
    birthDate: string;
    gender: 'male' | 'female';
    phoneLast4: string;
  };
  totalScore: number;
  normalizedScore: number;
  grade: string;
  sectionScores: Record<string, { score: number; maxScore: number; skipped: boolean }>;
  selectedItems: string[];
  skippedSections: string[];
  gradeInfo: {
    grade: string;
    level: number;
    description: string;
    color: string;
  };
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('surveyResult');
    if (!stored) {
      router.push('/');
      return;
    }
    const data = JSON.parse(stored);
    setResult(data);
    
    // 30점 이상이면 심층 진료 안내 모달 표시
    if (data.normalizedScore > 30) {
      setTimeout(() => setShowTreatmentModal(true), 1000);
    }
  }, [router]);

  const handleNewSurvey = () => {
    sessionStorage.clear();
    router.push('/');
  };

  const handleTreatmentAgreement = async (agreed: boolean) => {
    if (!result?.id) return;
    
    try {
      await fetch('/api/survey/agree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.id, agreed }),
      });
    } catch (error) {
      console.error('동의 저장 오류:', error);
    }
    
    setShowTreatmentModal(false);
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-light)]">결과 로딩 중...</p>
        </div>
      </div>
    );
  }

  const filteredSections = surveySections.filter(
    (section) => !section.genderSpecific || section.genderSpecific === result.patientInfo.gender
  );

  return (
    <main className="min-h-screen p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6 animate-fadeIn">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            자가진단 결과
          </h1>
          <p className="text-[var(--color-text-light)]">
            {result.patientInfo.name}님의 건강 상태 분석
          </p>
        </div>

        {/* 종합 점수 카드 */}
        <div className="card mb-6 animate-slideIn">
          <div className="text-center">
            <p className="text-sm text-[var(--color-text-light)] mb-2">종합 점수</p>
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={
                    result.gradeInfo.level === 1 ? '#16a34a' :
                    result.gradeInfo.level === 2 ? '#ca8a04' :
                    result.gradeInfo.level === 3 ? '#ea580c' : '#dc2626'
                  }
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(result.normalizedScore / 100) * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-3xl font-bold">{result.normalizedScore}</span>
            </div>
            <div className={`text-xl font-bold ${result.gradeInfo.color}`}>
              {result.gradeInfo.level}단계: {result.gradeInfo.grade}
            </div>
            <p className="text-sm text-[var(--color-text-light)] mt-2 max-w-sm mx-auto">
              {result.gradeInfo.description}
            </p>
          </div>
        </div>

        {/* 섹션별 점수 */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">영역별 분석</h2>
          <div className="space-y-3">
            {filteredSections.map((section) => {
              const sectionScore = result.sectionScores[section.id];
              if (!sectionScore) return null;
              
              const percentage = sectionScore.skipped 
                ? 0 
                : Math.round((sectionScore.score / sectionScore.maxScore) * 100);
              
              return (
                <div key={section.id} className="flex items-center gap-3">
                  <span className="text-xl w-8">{section.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{section.title}</span>
                      <span className={sectionScore.skipped ? 'text-gray-400' : ''}>
                        {sectionScore.skipped ? '해당없음' : `${sectionScore.score}/${sectionScore.maxScore}점`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: 
                            percentage <= 30 ? '#16a34a' :
                            percentage <= 50 ? '#ca8a04' :
                            percentage <= 70 ? '#ea580c' : '#dc2626'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="card mb-6 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-[var(--color-primary)]">안내</h3>
              <p className="text-sm text-[var(--color-text-light)] mt-1">
                이 결과는 참고용 자가진단이며, 정확한 진단은 원장님과의 상담을 통해 이루어집니다.
                데스크에 접수 완료를 알려주세요.
              </p>
            </div>
          </div>
        </div>

        {/* 새 설문 시작 버튼 */}
        <button
          onClick={handleNewSurvey}
          className="w-full btn btn-primary text-lg"
        >
          새 설문 시작하기
        </button>
      </div>

      {/* 심층 진료 동의 모달 */}
      {showTreatmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full animate-fadeIn">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🩺</div>
              <h2 className="text-xl font-bold text-[var(--color-primary)]">
                심층 진료 안내
              </h2>
            </div>
            
            <p className="text-center mb-6 text-[var(--color-text-light)]">
              자가진단 결과, 보다 정밀한 진단과 맞춤 치료가 필요해 보입니다.
              <br /><br />
              <strong>한약 처방</strong>, <strong>침/뜸 치료</strong> 등 
              심층 진료를 받아보시겠습니까?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleTreatmentAgreement(true)}
                className="w-full btn btn-primary"
              >
                네, 심층 진료를 원합니다
              </button>
              <button
                onClick={() => handleTreatmentAgreement(false)}
                className="w-full btn btn-secondary"
              >
                아니요, 일반 접수로 진행합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
