import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: '관리자 비밀번호가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }
    
    if (password === adminPassword) {
      // 간단한 세션 토큰 생성 (실제 운영에서는 더 안전한 방식 권장)
      const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
      
      const response = NextResponse.json({ success: true });
      
      // 쿠키에 토큰 저장 (24시간)
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24시간
      });
      
      return response;
    } else {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: '로그인에 실패했습니다.' },
      { status: 500 }
    );
  }
}
