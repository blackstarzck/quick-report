"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, SpinLoading, Dialog } from "antd-mobile";
import { EditSOutline, DeleteOutline } from "antd-mobile-icons";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/PageHeader";
import { BottomCTA } from "@/components/layout/BottomCTA";
import { KeywordTags } from "@/components/layout/KeywordTags";
import type { Report } from "@/types/report";

// 보고서 상세 조회
async function fetchReport(id: string): Promise<Report> {
  const response = await fetch(`/api/reports/${id}`);
  if (!response.ok) {
    throw new Error("보고서를 불러오는데 실패했습니다.");
  }
  return response.json();
}

// 보고서 삭제
async function deleteReport(id: string): Promise<void> {
  const response = await fetch(`/api/reports/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("보고서를 삭제하는데 실패했습니다.");
  }
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const reportId = params.id as string;

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => fetchReport(reportId),
    enabled: !!reportId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      router.replace("/");
    },
  });

  const handleDelete = async () => {
    const confirmed = await Dialog.confirm({
      title: "보고서 삭제",
      content: "정말 이 보고서를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.",
      confirmText: "삭제",
      cancelText: "취소",
    });

    if (confirmed) {
      deleteMutation.mutate();
    }
  };

  const handleEdit = () => {
    router.push(`/reports/daily/new?edit=${reportId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="보고서 상세" />
        <div className="flex justify-center items-center py-20">
          <SpinLoading color="primary" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="보고서 상세" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-6xl mb-4">😢</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">
            보고서를 찾을 수 없습니다
          </div>
          <div className="text-gray-500 text-center">
            삭제되었거나 존재하지 않는 보고서입니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="보고서 상세"
        right={
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            disabled={deleteMutation.isPending}
          >
            <DeleteOutline className="text-xl" />
          </button>
        }
      />

      <div className="px-4 py-6 page-content">
        {/* 보고서 헤더 정보 */}
        <Card
          className="card mb-4"
          style={{
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            border: "none",
          }}
        >
          <div className="space-y-3">
            {/* 날짜 및 세션 */}
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-semibold">
                {format(new Date(report.createdAt), "yyyy년 M월 d일 (EEE)", { locale: ko })}
              </span>
              {report.session && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    report.session === "AM"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {report.session === "AM" ? "출근 보고" : "퇴근 보고"}
                </span>
              )}
            </div>

            {/* 제목 */}
            {report.title && (
              <div>
                <div className="text-sm text-gray-500 mb-1">제목</div>
                <div className="font-semibold text-gray-900">{report.title}</div>
              </div>
            )}

            {/* AI 추출 키워드 */}
            {report.keywords && report.keywords.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-2">AI 추출 키워드</div>
                <KeywordTags keywords={report.keywords} />
              </div>
            )}

            {/* 상태 */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">상태:</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  report.status === "submitted"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {report.status === "submitted" ? "제출 완료" : "임시 저장"}
              </span>
            </div>
          </div>
        </Card>

        {/* 보고서 내용 */}
        <Card className="card">
          <div className="text-sm text-gray-500 mb-3">보고 내용</div>
          <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
            {report.content || (
              <span className="text-gray-400 italic">내용이 없습니다.</span>
            )}
          </div>
        </Card>

        {/* 작성 시간 정보 */}
        <div className="mt-4 text-center text-sm text-gray-400">
          <div>작성: {format(new Date(report.createdAt), "yyyy.MM.dd HH:mm", { locale: ko })}</div>
          {report.updatedAt && new Date(report.updatedAt).getTime() !== new Date(report.createdAt).getTime() && (
            <div>수정: {format(new Date(report.updatedAt), "yyyy.MM.dd HH:mm", { locale: ko })}</div>
          )}
        </div>
      </div>

      {/* 하단 CTA */}
      <BottomCTA
        buttons={[
          {
            label: "홈으로",
            onClick: () => router.push("/"),
            type: "default",
          },
          {
            label: "수정하기",
            onClick: handleEdit,
            type: "primary",
            icon: <EditSOutline />,
          },
        ]}
      />
    </div>
  );
}
