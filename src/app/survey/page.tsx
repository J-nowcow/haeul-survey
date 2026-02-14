'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, Brain, Utensils, Moon, Droplets, Thermometer,
  HeartPulse, Flower, User, CheckCircle2,
  ChevronRight, Wind, Waves,
} from 'lucide-react';
import {
  SECTIONS, CATEGORIES, QUESTIONS,
  getFilteredCategories, getMaxScore, analyzeResult,
} from '@/lib/survey-data';

// lucide-react 아이콘 매핑
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Utensils, Moon, Wind, Waves, Droplets, Thermometer, Brain, Flower,
  User, HeartPulse, Activity,
};

interface PatientInfo {
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  phoneLast4: string;
}

export default function SurveyPage() {
  const router = useRouter();
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [currentSection, setCurrentSection] = useState('functional');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('patientInfo');
    if (!stored) {
      router.push('/');
      return;
    }
    setPatientInfo(JSON.parse(stored));
  }, [router]);

  const maxPossibleScore = useMemo(() => {
    return getMaxScore(patientInfo?.gender);
  }, [patientInfo?.gender]);

  const totalScore = useMemo(
    () => Object.values(selectedItems).reduce((sum, score) => sum + score, 0),
    [selectedItems]
  );

  const normalizedScore = useMemo(() => {
    if (maxPossibleScore === 0) return 0;
    return Math.round((totalScore / maxPossibleScore) * 100);
  }, [totalScore, maxPossibleScore]);

  const toggleItem = (categoryId: string, questionId: string, score: number) => {
    setSelectedItems(prev => {
      const key = `${categoryId}-${questionId}`;
      const newItems = { ...prev };
      if (newItems[key]) delete newItems[key];
      else newItems[key] = score;
      return newItems;
    });
  };

  const handleSubmit = async () => {
    if (!patientInfo) return;
    setIsSubmitting(true);

    const gradeInfo = analyzeResult(normalizedScore);

    // 섹션별 점수 계산
    const sectionScores: Record<string, { score: number; maxScore: number; skipped: boolean }> = {};
    const allCategoryIds = Object.values(CATEGORIES).flat()
      .filter(cat => !cat.genderSpecific || cat.genderSpecific === patientInfo.gender)
      .map(cat => cat.id);

    allCategoryIds.forEach(catId => {
      const questions = QUESTIONS[catId] || [];
      const maxScore = questions.reduce((sum, q) => sum + q.score, 0);
      const score = questions.reduce((sum, q) => {
        return sum + (selectedItems[`${catId}-${q.id}`] || 0);
      }, 0);
      sectionScores[catId] = { score, maxScore, skipped: false };
    });

    const surveyData = {
      patientInfo,
      totalScore,
      normalizedScore,
      grade: gradeInfo.level,
      sectionScores,
      selectedItems: Object.keys(selectedItems),
      skippedSections: [],
    };

    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) throw new Error('제출 실패');

      const result = await response.json();

      sessionStorage.setItem('surveyResult', JSON.stringify({
        ...surveyData,
        id: result.id,
        gradeInfo: {
          ...gradeInfo,
          level: normalizedScore <= 30 ? 1 : normalizedScore <= 50 ? 2 : normalizedScore <= 80 ? 3 : 4,
        },
        normalizedScore,
      }));
      router.push('/result');
    } catch (error) {
      console.error('설문 제출 오류:', error);
      alert('설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  if (!patientInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-haeul-800 mx-auto" />
          <p className="mt-4 text-haeul-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const filteredCategories = getFilteredCategories(currentSection, patientInfo.gender);

  return (
    <div className="max-w-3xl mx-auto min-h-screen pb-32">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-md p-6 sticky top-0 z-20 shadow-sm border-b border-haeul-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-haeul-800">{patientInfo.name}님</h1>
            <p className="text-sm text-haeul-600 font-medium">해울한의원 자가진단</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-haeul-600 mb-1">현재 상태</div>
            <div className="text-2xl font-black text-haeul-800 leading-none">
              {normalizedScore}<span className="text-sm font-normal text-haeul-300"> / 100</span>
            </div>
          </div>
        </div>
        {/* 탭 바 */}
        <div className="flex p-1.5 bg-haeul-50 rounded-xl overflow-x-auto gap-1">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`flex-1 py-2.5 text-sm md:text-base font-bold rounded-lg whitespace-nowrap px-3 transition-colors ${
                currentSection === section.id
                  ? 'bg-white text-haeul-800 shadow-sm'
                  : 'text-haeul-300 hover:text-haeul-600'
              }`}
            >
              {section.title.split(' (')[0]}
            </button>
          ))}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="p-4 md:p-6">
        {/* 섹션 안내 */}
        <div className="mb-6 p-5 bg-haeul-800/5 border border-haeul-200 rounded-2xl text-haeul-800 text-sm md:text-base leading-relaxed">
          <p className="font-bold mb-1 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-haeul-800" />
            {SECTIONS.find(s => s.id === currentSection)?.title}
          </p>
          <p className="text-haeul-600 pl-6">
            {SECTIONS.find(s => s.id === currentSection)?.description}
          </p>
        </div>

        {/* 카테고리별 카드 */}
        {filteredCategories.map(category => {
          const IconComponent = ICON_MAP[category.iconName] || Activity;
          const questions = QUESTIONS[category.id] || [];

          return (
            <div key={category.id} className="mb-6 bg-white p-5 rounded-3xl shadow-sm border border-haeul-100">
              <div className={`flex items-center gap-2.5 mb-5 text-lg font-bold ${category.iconColor}`}>
                <IconComponent size={24} strokeWidth={2} />
                <h3>{category.name}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questions.map(q => {
                  const isSelected = !!selectedItems[`${category.id}-${q.id}`];
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleItem(category.id, q.id, q.score)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3 select-none ${
                        isSelected
                          ? 'bg-haeul-800 border-haeul-800 text-white shadow-md transform scale-[1.01]'
                          : 'bg-haeul-50 border-transparent text-haeul-600 hover:bg-haeul-100'
                      }`}
                    >
                      <div className="mt-0.5 min-w-[20px]">
                        {isSelected ? (
                          <CheckCircle2 size={20} className="text-white" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-haeul-200 bg-white" />
                        )}
                      </div>
                      <span className={`text-base font-medium leading-snug ${isSelected ? 'text-white' : ''}`}>
                        {q.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-haeul-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-20 safe-area-bottom">
        <div className="max-w-3xl mx-auto flex gap-3">
          {currentSection === 'functional' ? (
            <button
              onClick={() => { setCurrentSection('structural'); window.scrollTo(0, 0); }}
              className="btn-press w-full py-4 bg-haeul-800 text-white rounded-2xl font-bold text-lg hover:bg-haeul-900 flex items-center justify-center gap-2 shadow-lg"
            >
              다음 단계 (부위별 증상) <ChevronRight size={20} />
            </button>
          ) : (
            <div className="flex w-full gap-3">
              <button
                onClick={() => { setCurrentSection('functional'); window.scrollTo(0, 0); }}
                className="btn-press flex-1 py-4 bg-white border-2 border-haeul-200 text-haeul-600 rounded-2xl font-bold text-lg hover:bg-haeul-50"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-press flex-[2] py-4 bg-haeul-800 text-white rounded-2xl font-bold text-lg hover:bg-haeul-900 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? '제출 중...' : '결과 분석하기'} <Activity size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
