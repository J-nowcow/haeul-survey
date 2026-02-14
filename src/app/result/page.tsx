'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope, CheckCircle2, Microscope, ScanFace, Brain,
  Activity, HeartPulse, User, Check, ClipboardList, Save,
} from 'lucide-react';
import { analyzeResult } from '@/lib/survey-data';

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
    level: number;
    needsInDepth: boolean;
    color: string;
    description: string;
    treatments: string[];
  };
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [phase, setPhase] = useState<'result' | 'final'>('result');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('surveyResult');
    if (!stored) {
      router.push('/');
      return;
    }
    const data = JSON.parse(stored);
    // analyzeResult로 등급 정보 재계산
    const analysis = analyzeResult(data.normalizedScore);
    data.gradeInfo = {
      ...analysis,
      level: data.normalizedScore <= 30 ? 1 : data.normalizedScore <= 50 ? 2 : data.normalizedScore <= 80 ? 3 : 4,
    };
    setResult(data);
  }, [router]);

  const handleSave = async (agreed: boolean) => {
    if (!result?.id) return;
    setIsSaving(true);

    try {
      await fetch('/api/survey/agree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.id, agreed }),
      });
    } catch (error) {
      console.error('저장 오류:', error);
    }

    setPhase('final');
    window.scrollTo(0, 0);
    setIsSaving(false);
  };

  const handleReset = () => {
    sessionStorage.clear();
    router.push('/');
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-haeul-800 mx-auto" />
          <p className="mt-4 text-haeul-600">결과 로딩 중...</p>
        </div>
      </div>
    );
  }

  const resultAnalysis = analyzeResult(result.normalizedScore);

  // ========== Final 화면 ==========
  if (phase === 'final') {
    if (resultAnalysis.needsInDepth) {
      return (
        <div className="max-w-3xl mx-auto p-8 min-h-screen bg-haeul-900 flex flex-col items-center justify-center text-center text-white">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-pulse border border-white/20">
            <Check size={48} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white tracking-tight">심층 한약 상담 접수</h2>
          <div className="text-lg md:text-xl text-haeul-100 mb-12 max-w-md leading-relaxed space-y-4">
            <p>
              <span className="font-bold text-white border-b border-white/30 pb-0.5">{result.patientInfo.name}</span>님의 정밀 검사 및 심층 상담 요청이 성공적으로 접수되었습니다.
            </p>
            <p className="text-base md:text-lg opacity-90">
              원장님께서 환자분의 데이터를 검토 중이오니,<br />
              <span className="text-white font-bold">호명 전까지 대기실에서 잠시 휴식</span>을<br />
              취해주시기 바랍니다.
            </p>
          </div>

          <div className="w-full max-w-xs bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 mb-8">
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-haeul-300">접수 유형</span>
              <span className="font-bold text-white">심층 한약 상담</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-haeul-300">건강 점수</span>
              <span className="font-bold text-white">{result.normalizedScore}점</span>
            </div>
          </div>

          <button onClick={handleReset} className="text-haeul-300 hover:text-white underline text-sm transition-colors">
            처음으로 돌아가기
          </button>
        </div>
      );
    } else {
      return (
        <div className="max-w-3xl mx-auto p-8 min-h-screen bg-white flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-haeul-50 text-haeul-800 rounded-full flex items-center justify-center mb-6 border border-haeul-100">
            <ClipboardList size={40} />
          </div>
          <h2 className="text-3xl font-bold text-haeul-800 mb-4">일반 진료 접수 완료</h2>
          <p className="text-lg text-haeul-600 mb-8 max-w-md leading-relaxed">
            <span className="font-bold text-haeul-900">{result.patientInfo.name}</span>님의 설문 결과가 진료실로 전송되었습니다.<br /><br />
            잠시 대기해주시면<br />
            순서대로 진료실로 안내해드리겠습니다.
          </p>
          <button onClick={handleReset} className="text-haeul-400 hover:text-haeul-600 underline text-sm">
            새로운 환자분 시작하기
          </button>
        </div>
      );
    }
  }

  // ========== Result 화면 ==========
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 min-h-screen">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-haeul-100">
        {/* 딥그린 헤더 */}
        <div className="bg-haeul-800 p-8 text-center text-white">
          <h2 className="text-xl md:text-2xl font-bold mb-2 opacity-90">{result.patientInfo.name}님의 진단 결과</h2>
          <div className="text-7xl font-extrabold text-white mt-6 mb-6 tracking-tight">
            {result.normalizedScore} <span className="text-2xl font-normal opacity-60">점</span>
          </div>
          <div className="inline-block px-5 py-2 rounded-full font-bold border border-white/30 bg-white/10 backdrop-blur-md">
            {resultAnalysis.level}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* 상태 분석 */}
          <div className="bg-haeul-50 p-6 rounded-2xl border border-haeul-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-haeul-800 mb-3">
              <Stethoscope size={20} /> 상태 분석
            </h3>
            <p className="text-haeul-600 leading-relaxed whitespace-pre-wrap">{resultAnalysis.description}</p>
          </div>

          {/* 권장 치료 */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-haeul-800 mb-4">
              <CheckCircle2 size={20} /> 권장 치료
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {resultAnalysis.treatments.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-haeul-100 rounded-2xl shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-haeul-800" />
                  <span className="font-semibold text-haeul-800">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 분기 */}
          <div className="mt-12 pt-8 border-t border-haeul-100">
            {resultAnalysis.needsInDepth ? (
              <div className="bg-haeul-50 p-8 rounded-3xl border border-haeul-200 text-center">
                <div className="mb-5 inline-flex items-center justify-center w-14 h-14 bg-white text-haeul-800 rounded-full shadow-sm border border-haeul-100">
                  <Microscope size={28} />
                </div>
                <h4 className="font-bold text-haeul-900 text-xl mb-3">심층 진료 및 정밀 검사 안내</h4>

                <div className="text-haeul-600 text-sm md:text-base leading-relaxed mb-8 space-y-2">
                  <p>
                    현재 설문 결과를 바탕으로 만성적인 질환에 대해 <br />
                    <span className="font-bold text-haeul-800 border-b-2 border-haeul-200">소재영 원장님과의 자세한 상담</span>을 받아보시겠습니까?
                  </p>
                  <p className="pt-3 text-haeul-400 text-xs md:text-sm">
                    * 이후의 상담은 <strong>한약 치료 및 집중 관리</strong>를 전제로 하며,<br />
                    정확한 진단을 위해 아래의 <strong>심층 검사</strong>를 진행합니다.
                  </p>
                </div>

                {/* 심층 검사 아이콘 그리드 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-8 text-xs font-medium text-haeul-600">
                  <div className="bg-white p-3 rounded-xl border border-haeul-100 flex flex-col items-center gap-2 shadow-sm">
                    <ScanFace size={20} className="text-haeul-800" /> <span>체열 진단기</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-haeul-100 flex flex-col items-center gap-2 shadow-sm">
                    <Brain size={20} className="text-haeul-800" /> <span>뇌파 검사</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-haeul-100 flex flex-col items-center gap-2 shadow-sm">
                    <Activity size={20} className="text-haeul-800" /> <span>스트레스 검사</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-haeul-100 flex flex-col items-center gap-2 shadow-sm">
                    <HeartPulse size={20} className="text-haeul-800" /> <span>자율신경 검사</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-haeul-100 flex flex-col items-center gap-2 shadow-sm">
                    <User size={20} className="text-haeul-800" /> <span>체성분 검사</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-haeul-100 flex flex-col items-center gap-2 shadow-sm">
                    <Stethoscope size={20} className="text-haeul-800" /> <span>혈압/심부담도</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="btn-press w-full py-4 bg-haeul-800 text-white rounded-2xl font-bold text-lg hover:bg-haeul-900 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? '저장 중...' : '네, 심층 검사 및 상담을 받겠습니다'} <CheckCircle2 size={20} />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-haeul-600 mb-6 font-medium">
                  작성해주셔서 감사합니다.<br />진료실로 결과를 전송하고 상담을 대기합니다.
                </p>
                <button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="btn-press w-full py-4 bg-haeul-800 text-white rounded-2xl font-bold text-lg hover:bg-haeul-900 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? '저장 중...' : '결과 저장 및 진료 접수'} <Save size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
