import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';

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

// 환자 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: '인증이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const sql = getDb();
    const { id } = await params;
    const data = await request.json();
    
    const { patient_name, birth_date, gender, phone } = data;

    const result = await sql`
      UPDATE survey_results 
      SET 
        patient_name = ${patient_name},
        birth_date = ${birth_date},
        gender = ${gender},
        phone = ${phone}
      WHERE id = ${parseInt(id)}
      RETURNING *
    ` as Array<Record<string, unknown>>;

    if (result.length === 0) {
      return NextResponse.json(
        { error: '설문 결과를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('환자 정보 수정 오류:', error);
    return NextResponse.json(
      { error: '환자 정보 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 환자 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: '인증이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const sql = getDb();
    const { id } = await params;

    const result = await sql`
      DELETE FROM survey_results WHERE id = ${parseInt(id)}
      RETURNING id
    ` as Array<Record<string, unknown>>;

    if (result.length === 0) {
      return NextResponse.json(
        { error: '설문 결과를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('환자 삭제 오류:', error);
    return NextResponse.json(
      { error: '환자 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
