import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

interface TodayStats {
  count: number;
  avg_score: number;
  treatment_agreed_count: number;
}

interface WeeklyStats {
  date: string;
  count: number;
  avg_score: number;
}

interface DistributionStats {
  grade: string;
  count: number;
}

interface TotalStats {
  total_count: number;
  total_avg_score: number;
}

export async function GET() {
  try {
    const sql = getDb();
    const today = new Date().toISOString().split('T')[0];
    
    // 오늘 접수 통계
    const todayStats = await sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(AVG(normalized_score), 0) as avg_score,
        COUNT(*) FILTER (WHERE agreed_to_treatment = true) as treatment_agreed_count
      FROM survey_results
      WHERE DATE(created_at) = ${today}
    `;

    // 최근 7일 일별 통계
    const weeklyStats = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COALESCE(AVG(normalized_score), 0) as avg_score
      FROM survey_results
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    ` as WeeklyStats[];

    // 점수 분포 (그레이드별)
    const scoreDistribution = await sql`
      SELECT 
        CASE 
          WHEN normalized_score <= 20 THEN '양호'
          WHEN normalized_score <= 40 THEN '경도'
          WHEN normalized_score <= 60 THEN '중등도'
          ELSE '중증'
        END as grade,
        COUNT(*) as count
      FROM survey_results
      WHERE DATE(created_at) = ${today}
      GROUP BY 
        CASE 
          WHEN normalized_score <= 20 THEN '양호'
          WHEN normalized_score <= 40 THEN '경도'
          WHEN normalized_score <= 60 THEN '중등도'
          ELSE '중증'
        END
      ORDER BY 
        MIN(normalized_score)
    ` as DistributionStats[];

    // 전체 통계
    const totalStats = await sql`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(AVG(normalized_score), 0) as total_avg_score
      FROM survey_results
    ` as TotalStats[];

    return NextResponse.json({
      today: (todayStats as TodayStats[])[0],
      weekly: weeklyStats,
      distribution: scoreDistribution,
      total: totalStats[0],
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    return NextResponse.json(
      { error: '통계 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
