import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const data = await request.json();
    
    const {
      patientInfo,
      totalScore,
      normalizedScore,
      grade,
      sectionScores,
      selectedItems,
      skippedSections,
    } = data;

    // DB에 저장
    const result = await sql`
      INSERT INTO survey_results (
        patient_name,
        birth_date,
        gender,
        phone_last4,
        total_score,
        normalized_score,
        grade,
        section_scores,
        selected_items,
        skipped_sections
      ) VALUES (
        ${patientInfo.name},
        ${patientInfo.birthDate},
        ${patientInfo.gender},
        ${patientInfo.phoneLast4},
        ${totalScore},
        ${normalizedScore},
        ${grade},
        ${JSON.stringify(sectionScores)},
        ${JSON.stringify(selectedItems)},
        ${JSON.stringify(skippedSections)}
      )
      RETURNING id
    `;

    return NextResponse.json({ 
      success: true, 
      id: (result as Array<{id: number}>)[0].id 
    });
  } catch (error) {
    console.error('설문 저장 오류:', error);
    return NextResponse.json(
      { error: '설문 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    
    let results;
    
    if (date && search) {
      results = await sql`
        SELECT * FROM survey_results 
        WHERE DATE(created_at) = ${date}
        AND patient_name ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC LIMIT 100
      `;
    } else if (date) {
      results = await sql`
        SELECT * FROM survey_results 
        WHERE DATE(created_at) = ${date}
        ORDER BY created_at DESC LIMIT 100
      `;
    } else if (search) {
      results = await sql`
        SELECT * FROM survey_results 
        WHERE patient_name ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC LIMIT 100
      `;
    } else {
      results = await sql`
        SELECT * FROM survey_results 
        ORDER BY created_at DESC LIMIT 100
      `;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('설문 조회 오류:', error);
    return NextResponse.json(
      { error: '설문 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
