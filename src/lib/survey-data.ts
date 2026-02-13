// 설문 문항 데이터 정의

export interface SurveyQuestion {
  id: string;
  text: string;
  score: number; // 선택 시 부여되는 점수
}

export interface SurveySection {
  id: string;
  title: string;
  icon: string;
  description: string;
  questions: SurveyQuestion[];
  genderSpecific?: 'female' | 'male'; // 특정 성별에만 표시
}

export const surveySections: SurveySection[] = [
  // ===== A. 기능적 건강 상태 =====
  {
    id: 'digestion',
    title: '소화 기능',
    icon: '🍽️',
    description: '소화 관련 증상을 체크해주세요',
    questions: [
      { id: 'd1', text: '음식을 먹으면 자주 체한다', score: 2 },
      { id: 'd2', text: '메스꺼움이 자주 있다', score: 2 },
      { id: 'd3', text: '트림이 자주 나온다', score: 1 },
      { id: 'd4', text: '식욕이 없거나 불규칙하다', score: 2 },
      { id: 'd5', text: '속이 더부룩하고 가스가 찬다', score: 1 },
      { id: 'd6', text: '식후 졸리거나 피곤하다', score: 1 },
    ],
  },
  {
    id: 'sleep',
    title: '수면',
    icon: '😴',
    description: '수면 관련 증상을 체크해주세요',
    questions: [
      { id: 's1', text: '잠들기 어렵다 (30분 이상 소요)', score: 2 },
      { id: 's2', text: '자다가 자주 깬다', score: 2 },
      { id: 's3', text: '새벽에 일찍 깨서 다시 잠들기 어렵다', score: 2 },
      { id: 's4', text: '자고 일어나도 개운하지 않다', score: 2 },
      { id: 's5', text: '꿈을 많이 꾼다', score: 1 },
      { id: 's6', text: '낮에 졸리다', score: 1 },
      { id: 's7', text: '수면제를 복용 중이다', score: 2 },
    ],
  },
  {
    id: 'bowel',
    title: '대변/장',
    icon: '🚽',
    description: '배변 관련 증상을 체크해주세요',
    questions: [
      { id: 'b1', text: '변비가 있다 (3일 이상 못 봄)', score: 2 },
      { id: 'b2', text: '설사를 자주 한다', score: 2 },
      { id: 'b3', text: '변이 가늘거나 잔변감이 있다', score: 1 },
      { id: 'b4', text: '배에서 소리가 자주 난다', score: 1 },
      { id: 'b5', text: '복통이 자주 있다', score: 2 },
      { id: 'b6', text: '과민성 장 증후군 진단을 받은 적 있다', score: 2 },
    ],
  },
  {
    id: 'urinary',
    title: '소변/방광',
    icon: '💧',
    description: '소변 관련 증상을 체크해주세요',
    questions: [
      { id: 'u1', text: '소변을 자주 본다 (하루 8회 이상)', score: 2 },
      { id: 'u2', text: '야간에 소변을 보러 깬다', score: 2 },
      { id: 'u3', text: '소변이 급하다', score: 1 },
      { id: 'u4', text: '소변 볼 때 불편하다', score: 2 },
      { id: 'u5', text: '잔뇨감이 있다', score: 1 },
      { id: 'u6', text: '소변을 참기 어렵다', score: 2 },
    ],
  },
  {
    id: 'moisture',
    title: '수분 (땀/부종)',
    icon: '💦',
    description: '땀, 부종 관련 증상을 체크해주세요',
    questions: [
      { id: 'm1', text: '얼굴이나 손발이 잘 붓는다', score: 2 },
      { id: 'm2', text: '갈증이 심하다', score: 1 },
      { id: 'm3', text: '땀을 많이 흘린다 (자한)', score: 2 },
      { id: 'm4', text: '잘 때 식은땀이 난다 (도한)', score: 2 },
      { id: 'm5', text: '입이 자주 마른다', score: 1 },
      { id: 'm6', text: '물을 많이 마셔도 갈증이 해소되지 않는다', score: 2 },
    ],
  },
  {
    id: 'temperature',
    title: '한열 (냉/열)',
    icon: '🌡️',
    description: '추위, 더위 관련 증상을 체크해주세요',
    questions: [
      { id: 't1', text: '손발이 차다', score: 2 },
      { id: 't2', text: '추위를 많이 탄다', score: 1 },
      { id: 't3', text: '아랫배가 차다', score: 2 },
      { id: 't4', text: '얼굴이 화끈거린다 (상열감)', score: 2 },
      { id: 't5', text: '더위를 많이 탄다', score: 1 },
      { id: 't6', text: '몸에 열이 나는 느낌이 있다', score: 2 },
    ],
  },
  {
    id: 'mental',
    title: '정신/스트레스',
    icon: '🧠',
    description: '정신적 증상을 체크해주세요',
    questions: [
      { id: 'mt1', text: '가슴이 두근거린다 (심계)', score: 2 },
      { id: 'mt2', text: '불안하거나 초조하다', score: 2 },
      { id: 'mt3', text: '우울하거나 의욕이 없다', score: 2 },
      { id: 'mt4', text: '짜증이 잘 난다', score: 1 },
      { id: 'mt5', text: '집중력이 떨어진다', score: 1 },
      { id: 'mt6', text: '건망증이 심해졌다', score: 1 },
    ],
  },
  {
    id: 'menstrual',
    title: '생리 (여성)',
    icon: '🌸',
    description: '생리 관련 증상을 체크해주세요',
    genderSpecific: 'female',
    questions: [
      { id: 'mn1', text: '생리통이 심하다', score: 2 },
      { id: 'mn2', text: '생리 주기가 불규칙하다', score: 2 },
      { id: 'mn3', text: '생리량이 많거나 적다', score: 1 },
      { id: 'mn4', text: '생리 전 증후군(PMS)이 있다', score: 1 },
      { id: 'mn5', text: '생리 중 두통이나 어지럼증이 있다', score: 2 },
      { id: 'mn6', text: '폐경 관련 증상이 있다', score: 2 },
    ],
  },
  
  // ===== B. 부위별 구조적 증상 =====
  {
    id: 'head',
    title: '두면부 (머리/얼굴)',
    icon: '🤕',
    description: '머리, 얼굴 관련 증상을 체크해주세요',
    questions: [
      { id: 'h1', text: '두통이 자주 있다', score: 2 },
      { id: 'h2', text: '어지럼증이 있다', score: 2 },
      { id: 'h3', text: '눈이 피로하거나 침침하다', score: 1 },
      { id: 'h4', text: '이명(귀울림)이 있다', score: 2 },
      { id: 'h5', text: '코가 자주 막히거나 비염이 있다', score: 1 },
      { id: 'h6', text: '안면 통증이나 턱관절 불편감이 있다', score: 2 },
    ],
  },
  {
    id: 'chest',
    title: '흉부 (가슴)',
    icon: '💔',
    description: '가슴 관련 증상을 체크해주세요',
    questions: [
      { id: 'c1', text: '가슴이 답답하다', score: 2 },
      { id: 'c2', text: '숨이 차거나 호흡이 불편하다', score: 2 },
      { id: 'c3', text: '가슴에 통증이 있다', score: 3 },
      { id: 'c4', text: '기침이 자주 난다', score: 1 },
      { id: 'c5', text: '가래가 많다', score: 1 },
      { id: 'c6', text: '한숨을 자주 쉰다', score: 1 },
    ],
  },
  {
    id: 'abdomen',
    title: '복부 (배)',
    icon: '🫃',
    description: '배 관련 증상을 체크해주세요',
    questions: [
      { id: 'ab1', text: '명치가 불편하다', score: 2 },
      { id: 'ab2', text: '옆구리가 결린다', score: 1 },
      { id: 'ab3', text: '배꼽 주위가 아프다', score: 2 },
      { id: 'ab4', text: '아랫배가 불편하다', score: 2 },
      { id: 'ab5', text: '배가 자주 팽만하다', score: 1 },
      { id: 'ab6', text: '배를 누르면 아픈 곳이 있다', score: 2 },
    ],
  },
  {
    id: 'limbs',
    title: '사지 (팔다리)',
    icon: '💪',
    description: '팔, 다리 관련 증상을 체크해주세요',
    questions: [
      { id: 'l1', text: '손이나 발이 저리다', score: 2 },
      { id: 'l2', text: '팔다리가 무겁다', score: 1 },
      { id: 'l3', text: '손목이나 팔꿈치가 아프다', score: 2 },
      { id: 'l4', text: '다리에 쥐가 잘 난다', score: 1 },
      { id: 'l5', text: '종아리가 잘 붓는다', score: 1 },
      { id: 'l6', text: '팔다리 힘이 빠진다', score: 2 },
    ],
  },
  {
    id: 'spine',
    title: '관절/척추',
    icon: '🦴',
    description: '관절, 척추 관련 증상을 체크해주세요',
    questions: [
      { id: 'sp1', text: '목이 뻣뻣하거나 아프다', score: 2 },
      { id: 'sp2', text: '어깨가 아프다', score: 2 },
      { id: 'sp3', text: '등이 아프다', score: 2 },
      { id: 'sp4', text: '허리가 아프다', score: 2 },
      { id: 'sp5', text: '무릎이 아프다', score: 2 },
      { id: 'sp6', text: '관절에서 소리가 나거나 뻑뻑하다', score: 1 },
    ],
  },
];

// 전체 문항 수 계산 (여성 전용 제외)
export const getTotalQuestionCount = (gender: string) => {
  return surveySections
    .filter(section => !section.genderSpecific || section.genderSpecific === gender)
    .reduce((sum, section) => sum + section.questions.length, 0);
};

// 최대 점수 계산
export const getMaxScore = (gender: string) => {
  return surveySections
    .filter(section => !section.genderSpecific || section.genderSpecific === gender)
    .reduce((sum, section) => 
      sum + section.questions.reduce((s, q) => s + q.score, 0), 0);
};

// 그레이드 판정
export const getGrade = (normalizedScore: number): { grade: string; level: number; description: string; color: string } => {
  if (normalizedScore <= 20) {
    return {
      grade: '양호',
      level: 1,
      description: '현재 건강 상태가 양호합니다. 정기적인 관리를 권장드립니다.',
      color: 'text-green-600',
    };
  } else if (normalizedScore <= 40) {
    return {
      grade: '경도',
      level: 2,
      description: '가벼운 증상이 있습니다. 생활 습관 개선과 함께 한방 치료를 권장드립니다.',
      color: 'text-yellow-600',
    };
  } else if (normalizedScore <= 60) {
    return {
      grade: '중등도',
      level: 3,
      description: '중간 정도의 증상이 있습니다. 적극적인 한방 치료를 권장드립니다.',
      color: 'text-orange-600',
    };
  } else {
    return {
      grade: '중증',
      level: 4,
      description: '집중적인 관리가 필요합니다. 심층 진료 및 맞춤 치료를 강력히 권장드립니다.',
      color: 'text-red-600',
    };
  }
};
