"use client";

import { useRouter } from "next/navigation";
import { Button, Card, SpinLoading } from "antd-mobile";
import { EditSOutline, FileOutline, RightOutline } from "antd-mobile-icons";
import { format, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { KeywordTags } from "@/components/layout/KeywordTags";
import { useQuery } from "@tanstack/react-query";
import type { Report } from "@/types/report";

// API에서 보고서 목록 가져오기
async function fetchReports(): Promise<Report[]> {
  const response = await fetch("/api/reports");
  if (!response.ok) {
    throw new Error("보고서를 불러오는데 실패했습니다.");
  }
  return response.json();
}

export default function HomePage() {
  const router = useRouter();
  const today = new Date();
  
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });

  // 오늘 작성한 보고서가 있는지 확인
  const hasTodayReport = reports.some((report) => 
    isToday(new Date(report.createdAt))
  );

  return (
    <div className="min-h-screen gradient-bg">
      {/* 상단 헤더 영역 */}
      <div className="px-5 pt-8 pb-6 safe-area-top">
        <div className="text-sm text-gray-500 mb-1">
          {format(today, "yyyy년 M월 d일 EEEE", { locale: ko })}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">오늘의 보고</h1>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-4 pb-8 space-y-4">
        {/* 오늘의 보고 상태 카드 */}
        <Card
          className="card"
          style={{
            background: hasTodayReport
              ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
              : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            border: "none",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">
                {hasTodayReport ? "오늘의 보고 완료" : "오늘의 보고"}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {hasTodayReport ? "✓ 제출 완료" : "아직 작성하지 않았어요"}
              </div>
            </div>
            <Button
              color="primary"
              fill="solid"
              size="large"
              onClick={() => router.push("/reports/daily/new")}
              style={{
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              <EditSOutline className="mr-1" />
              {hasTodayReport ? "수정하기" : "작성하기"}
            </Button>
          </div>
        </Card>

        {/* 최근 보고 섹션 */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">최근 보고</h2>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <SpinLoading color="primary" />
              </div>
            ) : reports.length === 0 ? (
              <Card className="card">
                <div className="text-center py-4 text-gray-500">
                  아직 작성한 보고가 없습니다.
                </div>
              </Card>
            ) : (
              reports.slice(0, 3).map((report) => (
                <Card
                  key={report.id}
                  className="card cursor-pointer active:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/reports/${report.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileOutline className="text-blue-500" />
                        <span className="font-semibold text-gray-900">
                          {format(new Date(report.createdAt), "M월 d일 (EEE)", { locale: ko })}
                        </span>
                        {report.title && (
                          <span className="text-gray-600 text-sm truncate max-w-[150px]">
                            - {report.title}
                          </span>
                        )}
                      </div>
                      <KeywordTags keywords={report.keywords} maxDisplay={4} />
                    </div>
                    <RightOutline className="text-gray-400 mt-1" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* 빠른 시작 섹션 */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">빠른 시작</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card
              className="card cursor-pointer active:bg-gray-50 transition-colors"
              onClick={() => router.push("/reports/daily/new")}
            >
              <div className="text-center py-2">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                  <EditSOutline className="text-2xl text-blue-600" />
                </div>
                <div className="font-medium text-gray-900">새 보고 작성</div>
                <div className="text-xs text-gray-500 mt-1">처음부터 작성</div>
              </div>
            </Card>
            <Card
              className="card cursor-pointer active:bg-gray-50 transition-colors"
              onClick={() => router.push("/reports/daily/new?from=previous")}
            >
              <div className="text-center py-2">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                  <FileOutline className="text-2xl text-green-600" />
                </div>
                <div className="font-medium text-gray-900">이전 보고 활용</div>
                <div className="text-xs text-gray-500 mt-1">불러와서 수정</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
