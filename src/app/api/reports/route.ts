import { NextRequest, NextResponse } from 'next/server';
import { getReports, createReport } from '@/lib/notion/reports';

// GET /api/reports - 모든 보고서 조회
export async function GET() {
  try {
    const reports = await getReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error('보고서 조회 실패:', error);
    return NextResponse.json(
      { error: '보고서를 조회하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/reports - 새 보고서 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, content, keywords, status } = body;

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const report = await createReport({
      type,
      title,
      content,
      keywords: keywords || [],
      status,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('보고서 생성 실패:', error);
    return NextResponse.json(
      { error: '보고서를 생성하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
