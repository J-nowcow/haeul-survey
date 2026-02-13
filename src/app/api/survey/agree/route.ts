import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const { id, agreed } = await request.json();

    await sql`
      UPDATE survey_results 
      SET agreed_to_treatment = ${agreed}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('동의 저장 오류:', error);
    return NextResponse.json(
      { error: '동의 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}
