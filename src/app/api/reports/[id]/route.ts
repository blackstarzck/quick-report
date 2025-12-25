import { NextRequest, NextResponse } from 'next/server';
import { getReport, updateReportData, deleteReport } from '@/lib/notion/reports';

// GET /api/reports/[id] - 특정 보고서 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const report = await getReport(params.id);
    
    if (!report) {
      return NextResponse.json(
        { error: '보고서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('보고서 조회 실패:', error);
    return NextResponse.json(
      { error: '보고서를 조회하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH /api/reports/[id] - 보고서 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const report = await updateReportData(params.id, body);
    return NextResponse.json(report);
  } catch (error) {
    console.error('보고서 수정 실패:', error);
    return NextResponse.json(
      { error: '보고서를 수정하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] - 보고서 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteReport(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('보고서 삭제 실패:', error);
    return NextResponse.json(
      { error: '보고서를 삭제하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
