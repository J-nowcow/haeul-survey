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
  phone: string;
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
      r.phone,
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
  
  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    patient_name: result.patient_name,
    birth_date: result.birth_date,
    gender: result.gender,
    phone: result.phone,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 접기/펼치기 상태
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/survey/${result.id}`)
      .then(res => res.json())
      .then(data => setDetail(data));
  }, [result.id]);

  // 카테고리 한국어 매핑
  const CATEGORY_NAME_MAP: Record<string, string> = {
    digest: '소화',
    sleep: '수면',
    stool: '대변/장',
    urine: '소변/방광',
    fluid: '수분(땀/부종)',
    temp: '한열(추위/더위)',
    mental: '정신/스트레스',
    period: '생리(여성)',
    head_face: '두면부(머리/얼굴)',
    chest: '흉부(가슴/목)',
    abdomen: '복부(배)',
    limbs: '사지(팔다리)',
    joints: '관절/척추',
  };

  // 문항 데이터 (간략화 - 실제로는 survey-data.ts에서 가져와야 함)
  const QUESTIONS_MAP: Record<string, Record<string, string>> = {
    digest: { d1: '별다른 이유 없이 자주 체한다.', d2: '속이 메스껍고 구토가 나올 때가 종종 있다.', d3: '식사 후 오래 지나도 트림이 계속 나온다.', d4: '식욕이 별로 없어서 먹는 것이 귀찮다.', d5: '식사 후 자주 더부룩하고 가스가 찬다.', d6: '신물이 넘어오거나 속쓰림이 잦다.' },
    sleep: { s1: '잠들기까지 보통 30분 이상 걸린다.', s2: '자다가 중간에 자주 깬다.', s3: '새벽에 한 번 깨면 다시 잠들기 힘들다.', s4: '신경 쓰거나 스트레스 받으면 잠이 안 온다.', s5: '꿈을 자주 꾼다.', s6: '충분히 자고 일어나도 몸이 무겁다.', s7: '커피를 마시면 잠들기 어렵다.' },
    stool: { st1: '스트레스를 받거나 긴장하면 배가 아프다.', st2: '방귀가 자주 나오고 냄새가 독한 편이다.', st3: '변비가 심하다.', st4: '평소에 변이 묽고 퍼지는 편이다.', st5: '변을 보고 나서도 잔변감이 남는다.', st6: '특정 음식을 먹으면 배가 아프거나 설사한다.' },
    urine: { u1: '소변을 하루 8회 이상 자주 본다.', u2: '자다가 소변 때문에 1회 이상 깬다.', u3: '소변 줄기가 가늘고 힘이 없다.', u4: '소변을 보고 나서도 시원하지 않다.', u5: '갑자기 소변이 마려우면 참기 힘들다.', u6: '피곤하면 소변 색이 탁해지거나 거품이 많이 난다.' },
    fluid: { f1: '아침에 일어나면 얼굴이나 손이 퉁퉁 붓는다.', f2: '저녁이 되면 종아리나 발이 붓는다.', f3: '입이나 목구멍이 자주 마르고 갈증이 심하다.', f4: '조금만 움직여도 땀이 비오듯 쏟아진다.', f5: '잘 때만 유독 땀을 많이 흘린다.', f6: '물을 마셔도 갈증이 잘 해소되지 않는다.' },
    temp: { t1: '손발이 남들보다 유난히 차갑고 시리다.', t2: '얼굴이나 머리, 가슴 쪽으로 열이 확 오르는 느낌이 든다.', t3: '추위를 심하게 타서 여름에도 에어컨 바람이 싫다.', t4: '더위를 너무 많이 타고 찬물이나 찬 음료만 찾는다.', t5: '아랫배가 항상 차가운 느낌이 든다.', t6: '손바닥이나 발바닥에서 열이 나서 화끈거린다.' },
    mental: { m1: '가슴이 자주 두근거리고 불안한 느낌이 든다.', m2: '사소한 일에도 짜증이 나거나 화를 참기 힘들다.', m3: '가슴이 답답해서 나도 모르게 한숨을 자주 쉰다.', m4: '깜짝깜짝 잘 놀라고 마음이 조마조마하다.', m5: '머리가 멍하고 집중력/기억력이 예전 같지 않다.', m6: '의욕이 없고 만사가 귀찮으며 기분이 자주 우울하다.' },
    period: { p1: '생리통이 심해 진통제를 먹어야 한다.', p2: '생리 주기가 불규칙하다.', p3: '생리 양이 지나치게 많거나 적다.', p4: '생리혈에 검붉은 덩어리가 많이 섞여 나온다.', p5: '생리전/생리중에만 특정 증상이 심한 편이다.', p6: '생리 주기에 따라 대변이나 소화 상태가 변화한다.' },
    head_face: { h1: '두통이 있다.', h2: '어지럼증이 있다.', h3: '눈이 아프거나 피로하다.', h4: '비염이 있다.', h5: '입 안이 건조한 편이다.', h6: '귀에서 소리가 나거나 귀 먹먹함이 있다.' },
    chest: { c1: '가슴이 답답하다.', c2: '숨이 깊게 안 쉬어진다.', c3: '목에 이물감이 느껴진다.', c4: '심장 뛰는 소리가 종종 들린다.', c5: '한숨을 자주 쉰다.', c6: '등이 아플 때가 있다.' },
    abdomen: { a1: '명치 아래가 그득하고 답답하다.', a2: '배에서 심장 박동같은 박동이 느껴진다.', a3: '옆구리 아래가 그득하고 답답하다.', a4: '아랫배가 당기거나 뻐근하다.', a5: '복직근이 굳어 있다.', a6: '복식 호흡을 하기 어렵다.' },
    limbs: { l1: '손이나 발, 팔이나 다리가 저리다.', l2: '종아리 근육이 뭉치거나 쥐가 난다.', l3: '손바닥 발바닥이 화끈거린다.', l4: '팔 다리가 무겁게 느껴진다.', l5: '자려고 누우면 다리가 불편한 느낌이 든다.', l6: '손이 떨린다.' },
    joints: { j1: '뒷목과 어깨 부분이 굳거나 무겁고 아프다.', j2: '허리가 아프다.', j3: '무릎이 아프거나 시리다.', j4: '손목이나 발목 관절이 시큰거린다.', j5: '비가 오거나 흐린 날이면 관절이 쑤신다.', j6: '자고 일어나면 관절이 뻣뻣하다.' },
  };

  // 선택된 문항을 카테고리별로 그룹화
  const getGroupedItems = () => {
    if (!detail?.selected_items) return {};
    const grouped: Record<string, string[]> = {};
    detail.selected_items.forEach(item => {
      const [catId, qId] = item.split('-');
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(qId);
    });
    return grouped;
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(catId)) newSet.delete(catId);
      else newSet.add(catId);
      return newSet;
    });
  };

  // 선택되지 않은 문항을 카테고리별로 그룹화
  const getUnselectedGroupedItems = () => {
    if (!detail?.selected_items) return {};
    const selectedSet = new Set(detail.selected_items);
    const grouped: Record<string, string[]> = {};
    
    Object.entries(QUESTIONS_MAP).forEach(([catId, questions]) => {
      const unselectedQIds = Object.keys(questions).filter(qId => !selectedSet.has(`${catId}-${qId}`));
      if (unselectedQIds.length > 0) {
        grouped[catId] = unselectedQIds;
      }
    });
    return grouped;
  };

  const toggleAllCategories = () => {
    if (allExpanded) {
      setExpandedCategories(new Set());
      setAllExpanded(false);
    } else {
      // 양쪽 모든 카테고리를 펼치기
      const allCats = new Set([
        ...Object.keys(getGroupedItems()),
        ...Object.keys(getUnselectedGroupedItems())
      ]);
      setExpandedCategories(allCats);
      setAllExpanded(true);
    }
  };

  // 전화번호 포맷팅 함수
  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const normalized = digits.startsWith('010') ? digits : '010' + digits.replace(/^010/, '');
    const limited = normalized.slice(0, 11);
    if (limited.length <= 3) return limited;
    if (limited.length <= 7) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
  };

  // 저장 핸들러
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/survey/${result.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        alert('저장되었습니다.');
        setIsEditing(false);
        window.location.reload();
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!confirm(`정말 ${result.patient_name}님의 설문 결과를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/survey/${result.id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('삭제되었습니다.');
        window.location.reload();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const groupedItems = getGroupedItems();
  const unselectedGroupedItems = getUnselectedGroupedItems();
  const totalSelectedCount = detail?.selected_items?.length || 0;
  const totalUnselectedCount = Object.values(unselectedGroupedItems).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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

        {/* 기본 정보 (읽기/편집 모드) */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">기본 정보</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm px-3 py-1 bg-[var(--haeul-800)] text-white rounded-lg hover:bg-[var(--haeul-900)] transition"
              >
                수정하기
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-sm px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isSaving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      patient_name: result.patient_name,
                      birth_date: result.birth_date,
                      gender: result.gender,
                      phone: result.phone,
                    });
                  }}
                  className="text-sm px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  취소
                </button>
              </div>
            )}
          </div>
          
          {!isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 text-sm">이름</span>
                <p className="font-medium">{result.patient_name}</p>
              </div>
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
                <p className="font-medium">{result.phone}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">심층진료</span>
                <p className="font-medium">{result.agreed_to_treatment ? '동의함' : '미동의'}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500 text-sm block mb-1">이름</label>
                <input
                  type="text"
                  value={editData.patient_name}
                  onChange={(e) => setEditData({ ...editData, patient_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--haeul-800)]"
                />
              </div>
              <div>
                <label className="text-gray-500 text-sm block mb-1">생년월일</label>
                <input
                  type="text"
                  value={editData.birth_date}
                  onChange={(e) => setEditData({ ...editData, birth_date: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="800101"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--haeul-800)]"
                />
              </div>
              <div>
                <label className="text-gray-500 text-sm block mb-1">성별</label>
                <select
                  value={editData.gender}
                  onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--haeul-800)]"
                >
                  <option value="female">여성</option>
                  <option value="male">남성</option>
                </select>
              </div>
              <div>
                <label className="text-gray-500 text-sm block mb-1">연락처</label>
                <input
                  type="text"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: formatPhoneInput(e.target.value) })}
                  placeholder="010-1234-5678"
                  maxLength={13}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--haeul-800)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* 점수 */}
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm mb-2">종합 점수</p>
          <p className="text-4xl font-bold" style={{ color: GRADE_COLORS[result.grade.split(':')[1]?.trim()] }}>
            {result.normalized_score}점
          </p>
          <p className="mt-2 font-medium">{result.grade}</p>
        </div>

        {/* 영역별 점수 */}
        {detail?.section_scores && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">영역별 점수</h3>
            <div className="space-y-2">
              {Object.entries(detail.section_scores).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-32 text-sm truncate font-medium">{CATEGORY_NAME_MAP[key] || key}</span>
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

        {/* 설문 문항 보기 (좌우 분할) */}
        {detail && (
          <div className="mb-6">
            <div className="flex justify-center mb-3">
              <button
                onClick={toggleAllCategories}
                className="text-sm px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                {allExpanded ? '전체 접기' : '전체 펼치기'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 왼쪽: 선택한 문항 */}
              <div>
                <h3 className="font-semibold mb-3 text-[var(--haeul-800)]">✓ 선택한 문항 ({totalSelectedCount}개)</h3>
                {totalSelectedCount === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-400">
                    선택한 문항이 없습니다
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(groupedItems).map(([catId, qIds]) => (
                      <div key={catId} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleCategory(catId)}
                          className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition"
                        >
                          <span className="font-medium">{CATEGORY_NAME_MAP[catId] || catId} ({qIds.length}개)</span>
                          <span className="text-gray-400">{expandedCategories.has(catId) ? '▼' : '▶'}</span>
                        </button>
                        {expandedCategories.has(catId) && (
                          <div className="px-4 py-3 bg-white border-t border-gray-200">
                            {catId === 'period' && result.gender === 'male' ? (
                              <p className="text-sm text-gray-400 italic">해당되지 않는 항목입니다</p>
                            ) : (
                              <ul className="space-y-2">
                                {qIds.map(qId => (
                                  <li key={qId} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-[var(--haeul-800)]">✓</span>
                                    <span>{QUESTIONS_MAP[catId]?.[qId] || qId}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 오른쪽: 선택하지 않은 문항 */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-500">○ 선택하지 않은 문항 ({totalUnselectedCount}개)</h3>
                {totalUnselectedCount === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-400">
                    선택하지 않은 문항이 없습니다
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(unselectedGroupedItems).map(([catId, qIds]) => (
                      <div key={catId} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleCategory(catId)}
                          className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition"
                        >
                          <span className="font-medium">{CATEGORY_NAME_MAP[catId] || catId} ({qIds.length}개)</span>
                          <span className="text-gray-400">{expandedCategories.has(catId) ? '▼' : '▶'}</span>
                        </button>
                        {expandedCategories.has(catId) && (
                          <div className="px-4 py-3 bg-white border-t border-gray-200">
                            {catId === 'period' && result.gender === 'male' ? (
                              <p className="text-sm text-gray-400 italic">해당되지 않는 항목입니다</p>
                            ) : (
                              <ul className="space-y-2">
                                {qIds.map(qId => (
                                  <li key={qId} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-gray-400">○</span>
                                    <span>{QUESTIONS_MAP[catId]?.[qId] || qId}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 삭제 버튼 */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
          >
            {isDeleting ? '삭제 중...' : '🗑️ 이 설문 결과 삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}
