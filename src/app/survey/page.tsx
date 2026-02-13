'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import { surveySections, SurveySection, getMaxScore, getGrade } from '@/lib/survey-data';

interface PatientInfo {
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  phoneLast4: string;
}

export default function SurveyPage() {
  const router = useRouter();
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [skippedSections, setSkippedSections] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 성별에 따라 필터링된 섹션 목록
  const filteredSections = surveySections.filter(
    (section) => !section.genderSpecific || section.genderSpecific === patientInfo?.gender
  );

  const currentSection: SurveySection | undefined = filteredSections[currentSectionIndex];
  const totalSections = filteredSections.length;
  const isLastSection = currentSectionIndex === totalSections - 1;

  // 환자 정보 로드
  useEffect(() => {
    const stored = sessionStorage.getItem('patientInfo');
    if (!stored) {
      router.push('/');
      return;
    }
    setPatientInfo(JSON.parse(stored));
  }, [router]);

  // 섹션 전체 해당없음 토글
  const toggleSkipSection = (sectionId: string) => {
    const newSkipped = new Set(skippedSections);
    if (newSkipped.has(sectionId)) {
      newSkipped.delete(sectionId);
    } else {
      newSkipped.add(sectionId);
      // 해당 섹션의 선택된 항목들 모두 제거
      const newSelected = new Set(selectedItems);
      currentSection?.questions.forEach((q) => {
        newSelected.delete(q.id);
      });
      setSelectedItems(newSelected);
    }
    setSkippedSections(newSkipped);
  };

  // 개별 항목 토글
  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // 점수 계산
  const calculateScore = () => {
    let totalScore = 0;
    filteredSections.forEach((section) => {
      if (!skippedSections.has(section.id)) {
        section.questions.forEach((q) => {
          if (selectedItems.has(q.id)) {
            totalScore += q.score;
          }
        });
      }
    });
    return totalScore;
  };

  // 섹션별 점수 계산
  const calculateSectionScores = () => {
    const scores: Record<string, { score: number; maxScore: number; skipped: boolean }> = {};
    filteredSections.forEach((section) => {
      const maxScore = section.questions.reduce((sum, q) => sum + q.score, 0);
      if (skippedSections.has(section.id)) {
        scores[section.id] = { score: 0, maxScore, skipped: true };
      } else {
        const score = section.questions.reduce((sum, q) => {
          return sum + (selectedItems.has(q.id) ? q.score : 0);
        }, 0);
        scores[section.id] = { score, maxScore, skipped: false };
      }
    });
    return scores;
  };

  // 다음 섹션으로
  const handleNext = () => {
    if (isLastSection) {
      handleSubmit();
    } else {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  // 이전 섹션으로
  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // 설문 제출
  const handleSubmit = async () => {
    if (!patientInfo) return;
    
    setIsSubmitting(true);
    
    const totalScore = calculateScore();
    const maxScore = getMaxScore(patientInfo.gender);
    const normalizedScore = Math.round((totalScore / maxScore) * 100);
    const gradeInfo = getGrade(normalizedScore);
    const sectionScores = calculateSectionScores();

    const surveyData = {
      patientInfo,
      totalScore,
      normalizedScore,
      grade: `${gradeInfo.level}단계: ${gradeInfo.grade}`,
      sectionScores,
      selectedItems: Array.from(selectedItems),
      skippedSections: Array.from(skippedSections),
    };

    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        throw new Error('제출 실패');
      }

      const result = await response.json();
      
      // 결과 페이지로 이동
      sessionStorage.setItem('surveyResult', JSON.stringify({
        ...surveyData,
        id: result.id,
        gradeInfo,
      }));
      router.push('/result');
    } catch (error) {
      console.error('설문 제출 오류:', error);
      alert('설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  if (!patientInfo || !currentSection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-light)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  const isSectionSkipped = skippedSections.has(currentSection.id);

  return (
    <main className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            해울한의원 자가진단
          </h1>
          <p className="text-sm text-[var(--color-text-light)]">
            {patientInfo.name}님의 건강 상태를 체크합니다
          </p>
        </div>

        {/* 진행률 */}
        <ProgressBar
          current={currentSectionIndex + 1}
          total={totalSections}
          sectionName={`${currentSection.icon} ${currentSection.title}`}
        />

        {/* 섹션 카드 */}
        <div className="card animate-fadeIn">
          {/* 섹션 헤더 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{currentSection.icon}</span>
            <div>
              <h2 className="text-lg font-semibold">{currentSection.title}</h2>
              <p className="text-sm text-[var(--color-text-light)]">
                {currentSection.description}
              </p>
            </div>
          </div>

          {/* 전체 해당없음 체크박스 */}
          <div
            onClick={() => toggleSkipSection(currentSection.id)}
            className={`flex items-center gap-3 p-4 rounded-xl mb-4 cursor-pointer transition border-2 ${
              isSectionSkipped
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                : 'border-gray-200 bg-gray-50 hover:border-[var(--color-primary-light)]'
            }`}
          >
            <input
              type="checkbox"
              checked={isSectionSkipped}
              onChange={() => {}}
              className="checkbox-custom"
            />
            <div>
              <span className="font-semibold text-[var(--color-primary)]">
                이 섹션 전체 해당없음
              </span>
              <p className="text-sm text-[var(--color-text-light)]">
                아래 증상이 모두 없으시면 체크해주세요
              </p>
            </div>
          </div>

          {/* 개별 질문 목록 */}
          <div className={`space-y-3 ${isSectionSkipped ? 'opacity-40 pointer-events-none' : ''}`}>
            {currentSection.questions.map((question, index) => {
              const isSelected = selectedItems.has(question.id);
              return (
                <div
                  key={question.id}
                  onClick={() => !isSectionSkipped && toggleItem(question.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition border-2 ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-gray-200 hover:border-[var(--color-primary-light)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="checkbox-custom"
                  />
                  <span className="flex-1">
                    {index + 1}. {question.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 네비게이션 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-2xl mx-auto flex gap-4">
            <button
              onClick={handlePrev}
              disabled={currentSectionIndex === 0}
              className="flex-1 btn btn-secondary"
            >
              이전
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 btn btn-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  제출 중...
                </span>
              ) : isLastSection ? (
                '설문 완료'
              ) : (
                '다음'
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
