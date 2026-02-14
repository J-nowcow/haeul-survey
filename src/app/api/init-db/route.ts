import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // 기존 phone_last4 컬럼이 있으면 마이그레이션 실행
    const columnCheck = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'survey_results' AND column_name = 'phone_last4'
    ` as Array<Record<string, unknown>>;

    if (columnCheck.length > 0) {
      // 1. 먼저 컬럼 타입을 VARCHAR(20)으로 변경
      await sql`ALTER TABLE survey_results ALTER COLUMN phone_last4 TYPE VARCHAR(20)`;
      // 2. 기존 데이터를 010-0000-XXXX 형식으로 변환
      await sql`UPDATE survey_results SET phone_last4 = '010-0000-' || phone_last4 WHERE phone_last4 !~ '^010'`;
      // 3. 컬럼명 변경
      await sql`ALTER TABLE survey_results RENAME COLUMN phone_last4 TO phone`;
    }

    // 테이블 생성 (새로 생성 시)
    await sql`
      CREATE TABLE IF NOT EXISTS survey_results (
        id SERIAL PRIMARY KEY,
        patient_name VARCHAR(50) NOT NULL,
        birth_date VARCHAR(10) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        total_score INTEGER NOT NULL,
        normalized_score INTEGER NOT NULL,
        grade VARCHAR(50) NOT NULL,
        section_scores JSONB NOT NULL,
        selected_items JSONB NOT NULL,
        skipped_sections JSONB DEFAULT '[]',
        agreed_to_treatment BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_survey_results_created_at ON survey_results(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_survey_results_patient_name ON survey_results(patient_name)`;

    return NextResponse.json({ 
      success: true, 
      message: '데이터베이스 테이블이 생성/마이그레이션되었습니다.' 
    });
  } catch (error) {
    console.error('DB 초기화 오류:', error);
    return NextResponse.json(
      { error: 'DB 초기화에 실패했습니다.', details: String(error) },
      { status: 500 }
    );
  }
}
