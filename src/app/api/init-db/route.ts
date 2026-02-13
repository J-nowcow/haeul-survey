import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // 테이블 생성
    await sql`
      CREATE TABLE IF NOT EXISTS survey_results (
        id SERIAL PRIMARY KEY,
        patient_name VARCHAR(50) NOT NULL,
        birth_date VARCHAR(10) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        phone_last4 VARCHAR(4) NOT NULL,
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
      message: '데이터베이스 테이블이 생성되었습니다.' 
    });
  } catch (error) {
    console.error('DB 초기화 오류:', error);
    return NextResponse.json(
      { error: 'DB 초기화에 실패했습니다.', details: String(error) },
      { status: 500 }
    );
  }
}
