import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;
    
    const result = await sql`
      SELECT * FROM survey_results WHERE id = ${parseInt(id)}
    ` as Array<Record<string, unknown>>;

    if (result.length === 0) {
      return NextResponse.json(
        { error: '설문 결과를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('설문 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '설문 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
