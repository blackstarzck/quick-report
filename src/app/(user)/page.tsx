"use client";

import { useRouter } from "next/navigation";
import { Button, Card, SpinLoading } from "antd-mobile";
import { EditSOutline, FileOutline, RightOutline, ClockCircleOutline, CheckCircleOutline, ExclamationCircleOutline } from "antd-mobile-icons";
import { format, isToday, setHours, setMinutes, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import { KeywordTags } from "@/components/layout/KeywordTags";
import { useQuery } from "@tanstack/react-query";
import type { Report, ReportSession } from "@/types/report";

// API에서 보고서 목록 가져오기
async function fetchReports(): Promise<Report[]> {
  const response = await fetch("/api/reports");
  if (!response.ok) {
    throw new Error("보고서를 불러오는데 실패했습니다.");
  }
  return response.json();
}

// 출근 시간 가져오기 (월요일: 08:30, 그 외: 08:45)
function getWorkStartTime(date: Date): Date {
  const dayOfWeek = getDay(date); // 0: 일요일, 1: 월요일, ...
  if (dayOfWeek === 1) {
    // 월요일
    return setMinutes(setHours(date, 8), 30);
  }
  return setMinutes(setHours(date, 8), 45);
}

// 출근 보고 경고 시간 (출근 10분 전)
function getAmReportWarningTime(date: Date): Date {
  const dayOfWeek = getDay(date);
  if (dayOfWeek === 1) {
    // 월요일: 08:20
    return setMinutes(setHours(date, 8), 20);
  }
  // 그 외: 08:35
  return setMinutes(setHours(date, 8), 35);
}

// 현재 시간대 정보 (출/퇴근 표시용, 강제하지 않음)
function getTimeInfo(now: Date): {
  currentSession: ReportSession;
  workStartTime: string;
} {
  const workStart = getWorkStartTime(now);
  const workEnd = setHours(now, 18);
  const workStartTime = format(workStart, "HH:mm");

  if (now < workEnd) {
    return { currentSession: "AM", workStartTime };
  } else {
    return { currentSession: "PM", workStartTime };
  }
}

export default function HomePage() {
  const router = useRouter();
  const today = new Date();
  const { currentSession, workStartTime } = getTimeInfo(today);

  // 출근 보고 경고 여부 확인
  const amWarningTime = getAmReportWarningTime(today);
  const isAmWarningTime = today >= amWarningTime;

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });

  // 오늘 작성한 보고서 찾기
  const todayReports = reports.filter((report) => isToday(new Date(report.createdAt)));
  const amReport = todayReports.find((r) => r.session === "AM");
  const pmReport = todayReports.find((r) => r.session === "PM");

  // 현재 세션의 보고서가 있는지 확인
  const hasAmReport = !!amReport;
  const hasPmReport = !!pmReport;
  const hasBothReports = hasAmReport && hasPmReport;

  // 출근 보고 경고 표시 여부 (경고 시간 이후 + 아직 출근 보고 미제출)
  const showAmWarning = isAmWarningTime && !hasAmReport;

  // 현재 세션에 맞는 보고서 작성 페이지로 이동
  const handleWriteReport = (session: ReportSession) => {
    router.push(`/reports/daily/new?session=${session}`);
  };

  // 보고서 수정 페이지로 이동
  const handleEditReport = (reportId: string) => {
    router.push(`/reports/daily/new?edit=${reportId}`);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* 상단 헤더 영역 */}
      <div className="px-5 pt-8 pb-6 safe-area-top">
        <div className="text-sm text-gray-500 mb-1">
          {format(today, "yyyy년 M월 d일 EEEE", { locale: ko })}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">오늘의 보고</h1>
        <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
          <ClockCircleOutline />
          오늘 출근: {workStartTime}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-4 pb-8 space-y-4">
        {/* 출근 보고 경고 배너 */}
        {showAmWarning && (
          <Card
            className="card"
            style={{
              background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
              border: "2px solid #ef4444",
            }}
          >
            <div className="flex items-center gap-3">
              <ExclamationCircleOutline className="text-2xl text-red-600" />
              <div>
                <div className="font-bold text-red-700">⚠️ 출근 보고 미제출</div>
                <div className="text-sm text-red-600">
                  출근 시간({workStartTime})이 다가오고 있어요. 출근 보고를 작성해주세요!
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 전체 완료 상태 배너 */}
        {hasBothReports && (
          <Card
            className="card"
            style={{
              background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
              border: "none",
            }}
          >
            <div className="flex items-center gap-3">
              <CheckCircleOutline className="text-2xl text-green-600" />
              <div>
                <div className="font-bold text-gray-900">오늘의 보고 완료! 🎉</div>
                <div className="text-sm text-gray-600">출근/퇴근 보고를 모두 제출했습니다.</div>
              </div>
            </div>
          </Card>
        )}

        {/* 출근 보고 카드 */}
        <Card
          className="card"
          style={{
            background: hasAmReport
              ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
              : showAmWarning
                ? "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)"
                : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            border: showAmWarning ? "2px solid #ef4444" : "none",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-600">출근 보고</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {workStartTime} 전까지
                </span>
                {showAmWarning && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                    ⚠️ 급함
                  </span>
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {hasAmReport ? (
                  <span className="flex items-center gap-1">
                    <CheckCircleOutline className="text-green-600" /> 제출 완료
                  </span>
                ) : showAmWarning ? (
                  <span className="text-red-700">지금 바로 작성해주세요!</span>
                ) : (
                  "아직 작성하지 않았어요"
                )}
              </div>
            </div>
            <Button
              color={hasAmReport ? "default" : showAmWarning ? "danger" : "primary"}
              fill="solid"
              size="large"
              onClick={() => hasAmReport ? handleEditReport(amReport!.id) : handleWriteReport("AM")}
              style={{
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              <EditSOutline className="mr-1" />
              {hasAmReport ? "수정" : "작성하기"}
            </Button>
          </div>
        </Card>

        {/* 퇴근 보고 카드 */}
        <Card
          className="card"
          style={{
            background: hasPmReport
              ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
              : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            border: "none",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-600">퇴근 보고</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  퇴근 전
                </span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {hasPmReport ? (
                  <span className="flex items-center gap-1">
                    <CheckCircleOutline className="text-green-600" /> 제출 완료
                  </span>
                ) : (
                  "아직 작성하지 않았어요"
                )}
              </div>
            </div>
            <Button
              color={hasPmReport ? "default" : "primary"}
              fill="solid"
              size="large"
              onClick={() => hasPmReport ? handleEditReport(pmReport!.id) : handleWriteReport("PM")}
              style={{
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              <EditSOutline className="mr-1" />
              {hasPmReport ? "수정" : "작성하기"}
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
              reports.slice(0, 5).map((report) => (
                <Card
                  key={report.id}
                  className="card cursor-pointer active:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/reports/${report.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* 날짜, 시간, 출근/퇴근 구분 */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <FileOutline className="text-blue-500 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">
                          {format(new Date(report.createdAt), "M월 d일 (EEE)", { locale: ko })}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(report.createdAt), "HH:mm", { locale: ko })}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                          report.session === "AM"
                            ? "bg-blue-100 text-blue-700"
                            : report.session === "PM"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-600"
                        }`}>
                          {report.session === "AM" ? "🌅 출근 보고" : report.session === "PM" ? "🌙 퇴근 보고" : "📝 일반"}
                        </span>
                      </div>
                      {/* 제목 - 최대 1줄 */}
                      {report.title && (
                        <h3 className="font-medium text-gray-900 mb-1 truncate">
                          {report.title}
                        </h3>
                      )}
                      {/* 내용 미리보기 - 최대 2줄 */}
                      {report.content && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {report.content}
                        </p>
                      )}
                      <KeywordTags keywords={report.keywords} maxDisplay={4} />
                    </div>
                    <RightOutline className="text-gray-400 mt-1 flex-shrink-0" />
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
              onClick={() => router.push(currentSession ? `/reports/daily/new?session=${currentSession}` : "/reports/daily/new")}
            >
              <div className="text-center py-2">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                  <EditSOutline className="text-2xl text-blue-600" />
                </div>
                <div className="font-medium text-gray-900">
                  {currentSession === "AM" ? "출근 보고 작성" : currentSession === "PM" ? "퇴근 보고 작성" : "새 보고 작성"}
                </div>
                <div className="text-xs text-gray-500 mt-1">처음부터 작성</div>
              </div>
            </Card>
            <Card
              className="card cursor-pointer active:bg-gray-50 transition-colors"
              onClick={() => router.push(currentSession ? `/reports/daily/new?session=${currentSession}&from=previous` : "/reports/daily/new?from=previous")}
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
