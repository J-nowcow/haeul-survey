import { neon } from '@neondatabase/serverless';

// Neon serverless driver - 런타임에만 연결
export const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
  }
  return neon(process.env.DATABASE_URL);
};

// 테이블 생성 SQL (최초 1회 실행)
export const createTablesSQL = `
-- 환자 설문 결과 테이블
CREATE TABLE IF NOT EXISTS survey_results (
  id SERIAL PRIMARY KEY,
  
  -- 환자 정보
  patient_name VARCHAR(50) NOT NULL,
  birth_date VARCHAR(10) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  phone_last4 VARCHAR(4) NOT NULL,
  
  -- 설문 결과
  total_score INTEGER NOT NULL,
  normalized_score INTEGER NOT NULL,
  grade VARCHAR(50) NOT NULL,
  
  -- 섹션별 점수 (JSON)
  section_scores JSONB NOT NULL,
  
  -- 선택한 항목들 (JSON 배열)
  selected_items JSONB NOT NULL,
  
  -- 해당없음 체크한 섹션들 (JSON 배열)
  skipped_sections JSONB DEFAULT '[]',
  
  -- 심층 진료 동의 여부
  agreed_to_treatment BOOLEAN DEFAULT FALSE,
  
  -- 생성일시
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_survey_results_created_at ON survey_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_survey_results_patient_name ON survey_results(patient_name);
`;
