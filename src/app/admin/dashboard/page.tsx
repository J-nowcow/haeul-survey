'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface Stats {
  today: {
    count: number;
    avg_score: number;
    treatment_agreed_count: number;
  };
  weekly: Array<{
    date: string;
    count: number;
    avg_score: number;
  }>;
  distribution: Array<{
    grade: string;
    count: number;
  }>;
  total: {
    total_count: number;
    total_avg_score: number;
  };
}

interface SurveyResult {
  id: number;
  patient_name: string;
  birth_date: string;
  gender: string;
  phone_last4: string;
  total_score: number;
  normalized_score: number;
  grade: string;
  agreed_to_treatment: boolean;
  created_at: string;
}

const GRADE_COLORS: Record<string, string> = {
  '초기관리': '#16a34a',
  '적극치료': '#ca8a04',
  '집중치료': '#ea580c',
  '심화치료': '#dc2626',
  // 기존 데이터 호환
  '양호': '#16a34a',
  '경도': '#ca8a04',
  '중등도': '#ea580c',
  '중증': '#dc2626',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<SurveyResult | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, resultsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/survey?date=${dateFilter}${searchQuery ? `&search=${searchQuery}` : ''}`),
      ]);

      if (!statsRes.ok || !resultsRes.ok) {
        router.push('/admin');
        return;
      }

      const statsData = await statsRes.json();
      const resultsData = await resultsRes.json();

      setStats(statsData);
      setResults(resultsData);
    } catch {
      router.push('/admin');
    } finally {
      setIsLoading(false);
    }
  }, [router, dateFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ['이름', '생년월일', '성별', '연락처', '총점', '환산점수', '등급', '심층진료동의', '접수일시'];
    const rows = results.map(r => [
      r.patient_name,
      r.birth_date,
      r.gender === 'male' ? '남성' : '여성',
      r.phone_last4,
      r.total_score,
      r.normalized_score,
      r.grade,
      r.agreed_to_treatment ? '동의' : '미동의',
      format(new Date(r.created_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `설문결과_${dateFilter}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--haeul-800)]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <h1 className="text-xl font-bold text-[var(--haeul-800)]">
              해울한의원 관리자
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-[var(--haeul-800)] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              대시보드
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'list'
                  ? 'bg-[var(--haeul-800)] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              환자 목록
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' ? (
          // 대시보드 탭
          <div className="space-y-6">
            {/* 오늘 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">오늘 접수</p>
                <p className="text-3xl font-bold text-[var(--haeul-800)]">
                  {stats?.today.count || 0}명
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">오늘 평균 점수</p>
                <p className="text-3xl font-bold text-orange-600">
                  {Math.round(stats?.today.avg_score || 0)}점
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">심층 진료 동의</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.today.treatment_agreed_count || 0}명
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">전체 누적</p>
                <p className="text-3xl font-bold text-gray-700">
                  {stats?.total.total_count || 0}명
                </p>
              </div>
            </div>

            {/* 차트 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 주간 추이 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">📈 최근 7일 접수 현황</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats?.weekly || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MM/dd', { locale: ko })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value as string), 'yyyy년 MM월 dd일', { locale: ko })}
                      formatter={(value, name) => {
                        const numValue = Number(value);
                        return [
                          name === 'count' ? `${numValue}명` : `${Math.round(numValue)}점`,
                          name === 'count' ? '접수 수' : '평균 점수'
                        ];
                      }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#1B4D3E" strokeWidth={2} name="count" />
                    <Line type="monotone" dataKey="avg_score" stroke="#ea580c" strokeWidth={2} name="avg_score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 등급 분포 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">📊 오늘 등급 분포</h3>
                {stats?.distribution && stats.distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.distribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        nameKey="grade"
                        label={({ name, value }) => `${name}: ${value}명`}
                      >
                        {stats.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade] || '#888'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value)}명`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    오늘 데이터가 없습니다
                  </div>
                )}
              </div>

              {/* 점수대별 분포 (막대 그래프) */}
              <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">📋 점수대별 분포</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.distribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value)}명`} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {(stats?.distribution || []).map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={GRADE_COLORS[entry.grade] || '#888'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          // 환자 목록 탭
          <div className="space-y-4">
            {/* 필터 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium mb-1">날짜</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--haeul-800)]"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1">이름 검색</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="환자 이름으로 검색"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--haeul-800)]"
                />
              </div>
              <div className="self-end">
                <button onClick={handleExportCSV} className="py-2 px-4 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
                  📥 CSV 내보내기
                </button>
              </div>
            </div>

            {/* 결과 목록 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">이름</th>
                    <th className="text-left py-3 px-4">생년월일</th>
                    <th className="text-left py-3 px-4">성별</th>
                    <th className="text-left py-3 px-4">점수</th>
                    <th className="text-left py-3 px-4">등급</th>
                    <th className="text-left py-3 px-4">심층진료</th>
                    <th className="text-left py-3 px-4">접수시간</th>
                    <th className="text-left py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-400">
                        검색 결과가 없습니다
                      </td>
                    </tr>
                  ) : (
                    results.map((result) => (
                      <tr key={result.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{result.patient_name}</td>
                        <td className="py-3 px-4 text-gray-600">{result.birth_date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm ${
                            result.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {result.gender === 'male' ? '남' : '여'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">{result.normalized_score}점</span>
                        </td>
                        <td className="py-3 px-4">
                          <span 
                            className="px-2 py-1 rounded text-sm text-white"
                            style={{ backgroundColor: GRADE_COLORS[result.grade.split(':')[1]?.trim()] || '#888' }}
                          >
                            {result.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {result.agreed_to_treatment ? (
                            <span className="text-green-600 font-medium">✓ 동의</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {format(new Date(result.created_at), 'HH:mm')}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedResult(result)}
                            className="text-[var(--haeul-800)] hover:underline text-sm"
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 상세 보기 모달 */}
      {selectedResult && (
        <DetailModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      )}
    </main>
  );
}

function DetailModal({ result, onClose }: { result: SurveyResult; onClose: () => void }) {
  const [detail, setDetail] = useState<{
    section_scores: Record<string, { score: number; maxScore: number; skipped: boolean }>;
    selected_items: string[];
    skipped_sections: string[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/survey/${result.id}`)
      .then(res => res.json())
      .then(data => setDetail(data));
  }, [result.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">{result.patient_name}님 상세 결과</h2>
            <p className="text-gray-500 text-sm">
              {format(new Date(result.created_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="text-gray-500 text-sm">생년월일</span>
            <p className="font-medium">{result.birth_date}</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">성별</span>
            <p className="font-medium">{result.gender === 'male' ? '남성' : '여성'}</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">연락처</span>
            <p className="font-medium">****-{result.phone_last4}</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">심층진료</span>
            <p className="font-medium">{result.agreed_to_treatment ? '동의함' : '미동의'}</p>
          </div>
        </div>

        {/* 점수 */}
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm mb-2">종합 점수</p>
          <p className="text-4xl font-bold" style={{ color: GRADE_COLORS[result.grade.split(':')[1]?.trim()] }}>
            {result.normalized_score}점
          </p>
          <p className="mt-2 font-medium">{result.grade}</p>
        </div>

        {/* 섹션별 점수 */}
        {detail?.section_scores && (
          <div>
            <h3 className="font-semibold mb-3">영역별 점수</h3>
            <div className="space-y-2">
              {Object.entries(detail.section_scores).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-24 text-sm truncate">{key}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--haeul-800)] rounded-full"
                      style={{ width: value.skipped ? '0%' : `${(value.score / value.maxScore) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-20 text-right">
                    {value.skipped ? '해당없음' : `${value.score}/${value.maxScore}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
