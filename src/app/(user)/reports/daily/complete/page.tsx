"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Result, Card } from "antd-mobile";
import { CheckCircleFill } from "antd-mobile-icons";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { PageHeader } from "@/components/layout/PageHeader";
import { BottomCTA } from "@/components/layout/BottomCTA";
import { KeywordTags } from "@/components/layout/KeywordTags";
import { useReportDraftStore } from "@/store/reportDraft.store";

export default function DailyReportCompletePage() {
  const router = useRouter();
  const { submittedReport } = useReportDraftStore();

  useEffect(() => {
    if (!submittedReport) {
      router.replace("/");
    }
  }, [submittedReport, router]);

  if (!submittedReport) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="제출 완료"
        showBack={false}
      />

      <div className="px-4 py-6 page-content">
        {/* 완료 결과 */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircleFill className="text-5xl text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            보고가 제출되었습니다
          </h2>
          <p className="text-gray-500">
            {format(submittedReport.createdAt, "M월 d일 a h:mm", { locale: ko })}
          </p>
        </div>

        {/* 보고 요약 카드 */}
        <Card
          className="card mb-4"
          style={{
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            border: "none",
          }}
        >
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 mb-1">제목</div>
              <div className="font-semibold text-gray-900">
                {submittedReport.title}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">AI 추출 키워드</div>
              <KeywordTags keywords={submittedReport.keywords} />
            </div>
          </div>
        </Card>

        {/* 보고 내용 미리보기 */}
        <Card className="card">
          <div className="text-sm text-gray-500 mb-2">내용 미리보기</div>
          <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed max-h-48 overflow-y-auto hide-scrollbar">
            {submittedReport.content.length > 300
              ? submittedReport.content.substring(0, 300) + "..."
              : submittedReport.content}
          </div>
        </Card>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700 text-center">
            💡 공유 미리보기에서 카카오톡으로 보고를 공유할 수 있어요
          </p>
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
            label: "공유 미리보기",
            onClick: () => router.push("/reports/daily/share"),
            type: "primary",
          },
        ]}
      />
    </div>
  );
}

