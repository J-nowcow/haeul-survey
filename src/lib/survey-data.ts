// 설문 문항 데이터 정의 (원본 HTML 기반)

export interface SurveyQuestion {
  id: string;
  text: string;
  score: number;
}

export interface SurveyCategory {
  id: string;
  name: string;
  iconName: string; // lucide-react 아이콘 이름
  iconColor: string; // tailwind 텍스트 색상 클래스
  questions: SurveyQuestion[];
  genderSpecific?: 'female';
}

export interface SurveySection {
  id: string;
  title: string;
  description: string;
}

// --- 섹션 정의 ---
export const SECTIONS: SurveySection[] = [
  { id: 'functional', title: '기능적 건강 (전신 대사)', description: '오장육부의 흐름과 전신 컨디션을 체크합니다.' },
  { id: 'structural', title: '부위별 증상 (통증/불편)', description: '신체 각 부위의 통증과 불편함을 체크합니다.' },
];

// --- 카테고리 정의 ---
export const CATEGORIES: Record<string, SurveyCategory[]> = {
  functional: [
    { id: 'digest', name: '소화', iconName: 'Utensils', iconColor: 'text-orange-500', questions: [] },
    { id: 'sleep', name: '수면', iconName: 'Moon', iconColor: 'text-indigo-500', questions: [] },
    { id: 'stool', name: '대변/장', iconName: 'Wind', iconColor: 'text-amber-700', questions: [] },
    { id: 'urine', name: '소변/방광', iconName: 'Waves', iconColor: 'text-blue-400', questions: [] },
    { id: 'fluid', name: '수분(땀/부종)', iconName: 'Droplets', iconColor: 'text-blue-600', questions: [] },
    { id: 'temp', name: '한열(추위/더위)', iconName: 'Thermometer', iconColor: 'text-red-500', questions: [] },
    { id: 'mental', name: '정신/스트레스', iconName: 'Brain', iconColor: 'text-purple-500', questions: [] },
    { id: 'period', name: '생리(여성)', iconName: 'Flower', iconColor: 'text-pink-500', genderSpecific: 'female', questions: [] },
  ],
  structural: [
    { id: 'head_face', name: '두면부(머리/얼굴)', iconName: 'User', iconColor: 'text-haeul-800', questions: [] },
    { id: 'chest', name: '흉부(가슴/목)', iconName: 'HeartPulse', iconColor: 'text-rose-500', questions: [] },
    { id: 'abdomen', name: '복부(배)', iconName: 'Activity', iconColor: 'text-amber-600', questions: [] },
    { id: 'limbs', name: '사지(팔다리)', iconName: 'Activity', iconColor: 'text-cyan-600', questions: [] },
    { id: 'joints', name: '관절/척추', iconName: 'Activity', iconColor: 'text-slate-600', questions: [] },
  ],
};

// --- 문항 데이터 (원본 HTML 정확 복사) ---
export const QUESTIONS: Record<string, SurveyQuestion[]> = {
  digest: [
    { id: 'd1', text: '별다른 이유 없이 자주 체한다.', score: 3 },
    { id: 'd2', text: '속이 메스껍고 구토가 나올 때가 종종 있다.', score: 3 },
    { id: 'd3', text: '식사 후 오래 지나도 트림이 계속 나온다.', score: 2 },
    { id: 'd4', text: '식욕이 별로 없어서 먹는 것이 귀찮다.', score: 2 },
    { id: 'd5', text: '식사 후 자주 더부룩하고 가스가 찬다. (복부팽만)', score: 2 },
    { id: 'd6', text: '신물이 넘어오거나 속쓰림이 잦다.', score: 3 },
  ],
  sleep: [
    { id: 's1', text: '잠들기까지 보통 30분 이상 걸린다. (입면장애)', score: 3 },
    { id: 's2', text: '자다가 중간에 자주 깬다. (수면유지장애)', score: 3 },
    { id: 's3', text: '새벽에 한 번 깨면 다시 잠들기 힘들다. (재입면불리)', score: 3 },
    { id: 's4', text: '평소에는 잘 자다가도, 신경 쓰거나 스트레스 받으면 잠이 안 온다.', score: 2 },
    { id: 's5', text: '꿈을 자주 꾼다. 꿈 내용이 기억날 때도 많다.', score: 2 },
    { id: 's6', text: '충분히 자고 일어나도 몸이 무겁고 개운하지 않다.', score: 2 },
    { id: 's7', text: '커피를 마시면 잠들기 어렵다.', score: 2 },
  ],
  stool: [
    { id: 'st1', text: '스트레스를 받거나 긴장하면 배가 아프다.', score: 3 },
    { id: 'st2', text: '방귀가 자주 나오고 냄새가 독한 편이다.', score: 2 },
    { id: 'st3', text: '변비가 심해 며칠에 한 번 보거나, 힘들게(토끼똥) 본다.', score: 2 },
    { id: 'st4', text: '평소에 변이 묽고 퍼지는 편이다. (설사 경향)', score: 2 },
    { id: 'st5', text: '변을 보고 나서도 묵직한 느낌(잔변감)이 남는다.', score: 2 },
    { id: 'st6', text: '특정 음식을 먹으면 배가 아프거나 설사하는 경우가 있다.', score: 2 },
  ],
  urine: [
    { id: 'u1', text: '소변을 하루 8회 이상 너무 자주 본다. (빈뇨)', score: 2 },
    { id: 'u2', text: '자다가 소변 때문에 1회 이상 깬다. (야간뇨)', score: 3 },
    { id: 'u3', text: '소변 줄기가 가늘고 힘이 없거나 끊긴다.', score: 2 },
    { id: 'u4', text: '소변을 보고 나서도 시원하지 않고 남아있는 느낌이다.', score: 2 },
    { id: 'u5', text: '갑자기 소변이 마려우면 참기 힘들다. (절박뇨)', score: 3 },
    { id: 'u6', text: '피곤하면 소변 색이 탁해지거나 거품이 많이 난다.', score: 2 },
  ],
  fluid: [
    { id: 'f1', text: '아침에 일어나면 얼굴이나 손이 퉁퉁 붓는다.', score: 2 },
    { id: 'f2', text: '저녁이 되면 종아리나 발이 부어 신발이 꽉 낀다.', score: 2 },
    { id: 'f3', text: '입이나 목구멍이 자주 마르고 갈증이 심하다.', score: 2 },
    { id: 'f4', text: '조금만 움직여도 땀이 비오듯이 쏟아진다. (자한)', score: 3 },
    { id: 'f5', text: '잘 때만 유독 땀을 많이 흘린다.', score: 3 },
    { id: 'f6', text: '물을 마셔도 갈증이 잘 해소되지 않는 느낌이다.', score: 2 },
  ],
  temp: [
    { id: 't1', text: '손발이 남들보다 유난히 차갑고 시리다. (수족냉증)', score: 3 },
    { id: 't2', text: '얼굴이나 머리, 가슴 쪽으로 열이 확 오르는 느낌이 든다. (상열감)', score: 3 },
    { id: 't3', text: '추위를 심하게 타서 여름에도 에어컨 바람이 싫다.', score: 2 },
    { id: 't4', text: '더위를 너무 많이 타고 찬물이나 찬 음료만 찾는다.', score: 2 },
    { id: 't5', text: '아랫배가 항상 차가운 느낌이 든다. (하복냉)', score: 3 },
    { id: 't6', text: '손바닥이나 발바닥에서 열이 나서 화끈거린다.', score: 2 },
  ],
  mental: [
    { id: 'm1', text: '가슴이 자주 두근거리고 불안한 느낌이 든다. (심계)', score: 3 },
    { id: 'm2', text: '사소한 일에도 짜증이 나거나 화를 참기 힘들다.', score: 3 },
    { id: 'm3', text: '가슴이 답답해서 나도 모르게 한숨을 자주 쉰다.', score: 2 },
    { id: 'm4', text: '깜짝깜짝 잘 놀라고 마음이 조마조마하다.', score: 3 },
    { id: 'm5', text: '머리가 멍하고(Brain fog) 집중력/기억력이 예전 같지 않다.', score: 2 },
    { id: 'm6', text: '의욕이 없고 만사가 귀찮으며 기분이 자주 우울하다.', score: 3 },
  ],
  period: [
    { id: 'p1', text: '생리통이 심해 진통제를 먹어야 생활이 가능하다.', score: 3 },
    { id: 'p2', text: '생리 주기가 불규칙하다. (너무 빠르거나 늦다)', score: 3 },
    { id: 'p3', text: '생리 양이 지나치게 많거나, 반대로 너무 적다.', score: 2 },
    { id: 'p4', text: '생리혈에 검붉은 덩어리(혈괴)가 많이 섞여 나온다.', score: 2 },
    { id: 'p5', text: '생리전/ 생리중에만 생기는 특정 통증이나 증상이 심한 편이다 (PMS)', score: 2 },
    { id: 'p6', text: '생리 주기에 따라 대변이나 소화 상태가 변화한다.', score: 2 },
  ],
  head_face: [
    { id: 'h1', text: '두통이 있다.', score: 3 },
    { id: 'h2', text: '어지럼증이 있다.', score: 4 },
    { id: 'h3', text: '눈이 아프거나 피로하다.', score: 2 },
    { id: 'h4', text: '비염이 있다.', score: 2 },
    { id: 'h5', text: '입 안이 건조한 편이다.', score: 2 },
    { id: 'h6', text: "귀에서 '삐-' 소리가 나거나(이명), 귀 먹먹함이 있다.", score: 3 },
  ],
  chest: [
    { id: 'c1', text: '가슴이 답답하다.', score: 3 },
    { id: 'c2', text: '숨이 깊게 안 쉬어진다.', score: 3 },
    { id: 'c3', text: '목에 이물감이 느껴진다.', score: 3 },
    { id: 'c4', text: '심장 뛰는 소리가 종종 들린다.', score: 3 },
    { id: 'c5', text: '한숨을 자주 쉰다.', score: 2 },
    { id: 'c6', text: '등이 아플 때가 있다.', score: 2 },
  ],
  abdomen: [
    { id: 'a1', text: '명치 아래가 그득하고 답답하다.', score: 3 },
    { id: 'a2', text: '배에서 심장 박동같은 박동이 느껴진다.', score: 3 },
    { id: 'a3', text: '옆구리 아래가 그득하고 답답하다.', score: 3 },
    { id: 'a4', text: '아랫배가 당기거나 뻐근하다.', score: 2 },
    { id: 'a5', text: '복직근이 굳어 있다.', score: 2 },
    { id: 'a6', text: '복식 호흡을 하기 어렵다.', score: 2 },
  ],
  limbs: [
    { id: 'l1', text: '손이나 발, 팔이나 다리가 저리다.', score: 2 },
    { id: 'l2', text: '종아리 근육이 뭉치거나 쥐가 난다.', score: 2 },
    { id: 'l3', text: '손바닥 발바닥이 화끈거린다.', score: 2 },
    { id: 'l4', text: '팔 다리가 무겁게 느껴진다.', score: 3 },
    { id: 'l5', text: '자려고 누우면 다리가 불편한 느낌이 든다.', score: 3 },
    { id: 'l6', text: '손이 떨린다.', score: 2 },
  ],
  joints: [
    { id: 'j1', text: '뒷목과 어깨 부분이 굳거나 무겁고 아프다.', score: 2 },
    { id: 'j2', text: '허리가 아프다.', score: 3 },
    { id: 'j3', text: '무릎이 아프거나 시리다.', score: 2 },
    { id: 'j4', text: '손목이나 발목 관절이 시큰거린다.', score: 2 },
    { id: 'j5', text: '비가 오거나 흐린 날이면 관절이 쑤신다.', score: 2 },
    { id: 'j6', text: '자고 일어나면 관절이 뻣뻣하다.', score: 2 },
  ],
};

// --- 등급 판정 (원본 HTML analyzeResult 함수 기반) ---
export interface GradeInfo {
  level: string;
  needsInDepth: boolean;
  color: string;
  description: string;
  treatments: string[];
}

export const analyzeResult = (normalizedScore: number): GradeInfo => {
  if (normalizedScore <= 30) {
    return {
      level: '1단계 : 초기 관리',
      needsInDepth: false,
      color: 'bg-haeul-100 text-haeul-800 border-haeul-200',
      description: '전반적인 건강 상태가 비교적 양호합니다. 현재의 불편함은 적절한 치료와 관리로 충분히 개선될 수 있습니다.',
      treatments: [
        '침 치료 / 약침 치료',
        '추나치료 및 생활 관리',
        '정기적인 건강 체크',
      ],
    };
  } else if (normalizedScore <= 50) {
    return {
      level: '2단계 : 적극 치료',
      needsInDepth: true,
      color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      description: '신체 균형이 다소 불안정한 상태입니다. 증상이 만성화되기 전에 적극적인 치료적 개입이 권장됩니다.',
      treatments: [
        '맞춤 한약 처방 (4주)',
        '산삼 약침 치료 (10회+)',
        '자율신경계 조절 치료',
      ],
    };
  } else if (normalizedScore <= 80) {
    return {
      level: '3단계 : 집중 치료',
      needsInDepth: true,
      color: 'bg-orange-50 text-orange-900 border-orange-200',
      description: '기능 저하와 구조적 문제가 복합적으로 나타나고 있습니다. 재발 방지를 위한 근본적인 치료가 필요합니다.',
      treatments: [
        '맞춤 한약 처방 (12주)',
        '태반 약침 치료 (10회+)',
        '면역 및 재생 기능 회복 처방',
        '정밀 증상 피드백 및 관찰',
      ],
    };
  } else {
    return {
      level: '4단계 : 심화 치료',
      needsInDepth: true,
      color: 'bg-red-50 text-red-900 border-red-200',
      description: '심각한 증상이 다발적으로 나타나고 있습니다. 장기간의 체계적인 치료 계획과 집중적인 관리가 필수적입니다.',
      treatments: [
        '맞춤 한약 처방 (24주 프로그램)',
        '녹용 약침 치료 (10회+)',
        '고농도 집중 치료 처방',
        '심층 예후 관찰 및 1:1 케어',
      ],
    };
  }
};

// --- 유틸리티 함수 ---

// 성별에 따라 카테고리 필터링
export const getFilteredCategories = (sectionId: string, gender?: string): SurveyCategory[] => {
  const categories = CATEGORIES[sectionId] || [];
  return categories.filter(cat => !cat.genderSpecific || cat.genderSpecific === gender);
};

// 전체 카테고리 flat 반환 (성별 필터 포함)
export const getAllCategories = (gender?: string): SurveyCategory[] => {
  return Object.keys(CATEGORIES).flatMap(sectionId => getFilteredCategories(sectionId, gender));
};

// 최대 점수 계산
export const getMaxScore = (gender?: string): number => {
  let sum = 0;
  const allCats = getAllCategories(gender);
  allCats.forEach(cat => {
    const questions = QUESTIONS[cat.id] || [];
    questions.forEach(q => { sum += q.score; });
  });
  return sum;
};

// --- 관리자 대시보드 호환용 (기존 surveySections 형태) ---
export interface LegacySurveySection {
  id: string;
  title: string;
  icon: string;
  description: string;
  questions: SurveyQuestion[];
  genderSpecific?: 'female' | 'male';
}

const ICON_EMOJI_MAP: Record<string, string> = {
  digest: '🍽️', sleep: '😴', stool: '🚽', urine: '💧', fluid: '💦',
  temp: '🌡️', mental: '🧠', period: '🌸', head_face: '🤕',
  chest: '💔', abdomen: '🫃', limbs: '💪', joints: '🦴',
};

export const surveySections: LegacySurveySection[] = Object.values(CATEGORIES)
  .flat()
  .map(cat => ({
    id: cat.id,
    title: cat.name,
    icon: ICON_EMOJI_MAP[cat.id] || '📋',
    description: `${cat.name} 관련 증상을 체크해주세요`,
    questions: QUESTIONS[cat.id] || [],
    ...(cat.genderSpecific ? { genderSpecific: cat.genderSpecific } : {}),
  }));

// 기존 getGrade 호환 함수
export const getGrade = (normalizedScore: number): { grade: string; level: number; description: string; color: string } => {
  const result = analyzeResult(normalizedScore);
  const levelNum = normalizedScore <= 30 ? 1 : normalizedScore <= 50 ? 2 : normalizedScore <= 80 ? 3 : 4;
  const gradeName = normalizedScore <= 30 ? '초기관리' : normalizedScore <= 50 ? '적극치료' : normalizedScore <= 80 ? '집중치료' : '심화치료';
  return {
    grade: gradeName,
    level: levelNum,
    description: result.description,
    color: normalizedScore <= 30 ? 'text-green-600' : normalizedScore <= 50 ? 'text-yellow-600' : normalizedScore <= 80 ? 'text-orange-600' : 'text-red-600',
  };
};
