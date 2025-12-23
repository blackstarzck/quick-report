"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Dialog, Toast } from "antd-mobile";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { PageHeader } from "@/components/layout/PageHeader";
import { BottomCTA } from "@/components/layout/BottomCTA";
import { KeywordTags } from "@/components/layout/KeywordTags";
import { useReportDraftStore } from "@/store/reportDraft.store";

export default function DailyReportSharePage() {
  const router = useRouter();
  const { submittedReport, clearSubmittedReport } = useReportDraftStore();
  const [showKakaoDialog, setShowKakaoDialog] = useState(false);

  useEffect(() => {
    if (!submittedReport) {
      router.replace("/");
    }
  }, [submittedReport, router]);

  if (!submittedReport) {
    return null;
  }

  const handleKakaoShare = () => {
    setShowKakaoDialog(true);
  };

  const handleCopyLink = () => {
    // Mock: 클립보드 복사
    const shareText = `[업무 보고] ${submittedReport.title}\n\n키워드: ${submittedReport.keywords.join(", ")}\n\n${submittedReport.content.substring(0, 200)}...`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      Toast.show({
        content: "클립보드에 복사되었습니다",
        position: "bottom",
      });
    }).catch(() => {
      Toast.show({
        content: "복사에 실패했습니다",
        position: "bottom",
      });
    });
  };

  const handleComplete = () => {
    clearSubmittedReport();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="공유 미리보기" />

      <div className="px-4 py-6 page-content">
        {/* 공유 미리보기 카드 */}
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2 text-center">
            공유 시 아래와 같이 표시됩니다
          </div>
        </div>

        {/* 공유 카드 프리뷰 */}
        <Card
          className="card overflow-hidden"
          style={{
            border: "2px solid #e5e7eb",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {/* 헤더 영역 */}
          <div
            className="px-4 py-3 -mx-4 -mt-4 mb-4"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
            }}
          >
            <div className="text-white/80 text-xs mb-1">업무 보고</div>
            <div className="text-white font-bold text-lg">
              {submittedReport.title}
            </div>
            <div className="text-white/70 text-xs mt-1">
              {format(submittedReport.createdAt, "yyyy.M.d (EEE) a h:mm", {
                locale: ko,
              })}
            </div>
          </div>

          {/* 키워드 */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2 font-medium">
              📌 핵심 키워드
            </div>
            <KeywordTags keywords={submittedReport.keywords} />
          </div>

          {/* 내용 요약 */}
          <div>
            <div className="text-xs text-gray-500 mb-2 font-medium">
              📝 내용 요약
            </div>
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {submittedReport.content.length > 200
                ? submittedReport.content.substring(0, 200) + "..."
                : submittedReport.content}
            </div>
          </div>

          {/* 푸터 */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <span className="text-xs text-gray-400">Quick Report로 작성됨</span>
          </div>
        </Card>

        {/* 공유 옵션 */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleKakaoShare}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-colors"
            style={{
              backgroundColor: "#FEE500",
              color: "#000000",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.457 37.943-24.811 43.944-29.03 5.995.849 12.168 1.28 18.472 1.28 57.438 0 104-36.712 104-82 0-45.287-46.562-82-104-82z" />
            </svg>
            카카오톡으로 공유
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold bg-gray-100 text-gray-700 active:bg-gray-200 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            텍스트 복사하기
          </button>
        </div>
      </div>

      {/* 하단 CTA */}
      <BottomCTA
        buttons={[
          {
            label: "완료",
            onClick: handleComplete,
            type: "primary",
          },
        ]}
      />

      {/* 카카오 공유 안내 다이얼로그 */}
      <Dialog
        visible={showKakaoDialog}
        content={
          <div className="text-center py-2">
            <div className="text-4xl mb-3">🚧</div>
            <div className="font-bold text-lg mb-2">추후 연동 예정</div>
            <div className="text-gray-500 text-sm">
              카카오톡 공유 기능은<br />
              다음 업데이트에서 지원될 예정입니다.
            </div>
          </div>
        }
        closeOnAction
        actions={[
          {
            key: "confirm",
            text: "확인",
            bold: true,
          },
        ]}
        onClose={() => setShowKakaoDialog(false)}
      />
    </div>
  );
}

