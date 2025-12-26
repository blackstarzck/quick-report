"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextArea, Input, Toast, SpinLoading } from "antd-mobile";
import { FileOutline, HistogramOutline } from "antd-mobile-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/PageHeader";
import { BottomCTA } from "@/components/layout/BottomCTA";
import { TemplateBottomSheet } from "@/components/report/TemplateBottomSheet";
import { PreviousReportBottomSheet } from "@/components/report/PreviousReportBottomSheet";
import { useReportDraftStore } from "@/store/reportDraft.store";
import { reportFormSchema, type ReportFormData } from "@/lib/validators/report";
import { extractKeywordsAsync } from "@/lib/keywords/extractor";
import type { Template, PreviousReport, Report, ReportSession } from "@/types/report";

// 보고서 조회
async function fetchReport(id: string): Promise<Report> {
  const response = await fetch(`/api/reports/${id}`);
  if (!response.ok) {
    throw new Error("보고서를 불러오는데 실패했습니다.");
  }
  return response.json();
}

// 노션에 보고서 저장
async function submitReport(data: {
  type: string;
  session?: ReportSession;
  title: string;
  content: string;
  keywords: string[];
  status: string;
}): Promise<Report> {
  const response = await fetch("/api/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("보고서 저장에 실패했습니다.");
  }

  return response.json();
}

// 보고서 수정
async function updateReport(id: string, data: {
  title: string;
  content: string;
  keywords: string[];
  status: string;
}): Promise<Report> {
  const response = await fetch(`/api/reports/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("보고서 수정에 실패했습니다.");
  }

  return response.json();
}

function DailyReportNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { draft, setDraft, clearDraft, setSubmittedReport } =
    useReportDraftStore();

  const [templateSheetVisible, setTemplateSheetVisible] = useState(false);
  const [previousSheetVisible, setPreviousSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDataLoaded, setIsEditDataLoaded] = useState(false);

  const today = new Date();
  const defaultTitle = format(today, "M월 d일 업무 보고", { locale: ko });

  // 수정 모드 및 세션 파라미터 확인
  const editId = searchParams.get("edit");
  const sessionParam = searchParams.get("session") as ReportSession | null;
  const isEditMode = !!editId;

  // 수정할 보고서 조회
  const { data: editReport, isLoading: isLoadingEdit } = useQuery({
    queryKey: ["report", editId],
    queryFn: () => fetchReport(editId!),
    enabled: isEditMode,
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: draft.title || defaultTitle,
      content: draft.content || "",
    },
    mode: "onChange",
  });

  const content = watch("content");
  const title = watch("title");

  // 수정 모드: 기존 보고서 데이터로 폼 초기화
  useEffect(() => {
    if (isEditMode && editReport && !isEditDataLoaded) {
      reset({
        title: editReport.title || defaultTitle,
        content: editReport.content || "",
      });
      setIsEditDataLoaded(true);
    }
  }, [isEditMode, editReport, reset, defaultTitle, isEditDataLoaded]);

  // 초안 자동 저장 (수정 모드가 아닐 때만)
  useEffect(() => {
    if (!isEditMode) {
      setDraft({ title, content });
    }
  }, [title, content, setDraft, isEditMode]);

  // 이전 보고 불러오기 파라미터 처리
  useEffect(() => {
    if (searchParams.get("from") === "previous") {
      setPreviousSheetVisible(true);
    }
  }, [searchParams]);

  const handleTemplateSelect = (template: Template) => {
    setValue("content", template.content, { shouldValidate: true });
    Toast.show({
      content: "템플릿이 적용되었습니다",
      position: "bottom",
    });
  };

  const handlePreviousReportSelect = (report: PreviousReport) => {
    setValue("content", report.content, { shouldValidate: true });
    Toast.show({
      content: "이전 보고를 불러왔습니다",
      position: "bottom",
    });
  };

  const handleSaveDraft = () => {
    Toast.show({
      content: "임시 저장되었습니다",
      position: "bottom",
    });
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);

    try {
      // AI 키워드 추출
      const keywords = await extractKeywordsAsync(data.content);

      let report: Report;

      if (isEditMode && editId) {
        // 수정 모드: 기존 보고서 업데이트
        report = await updateReport(editId, {
          title: data.title,
          content: data.content,
          keywords,
          status: "submitted",
        });
      } else {
        // 새 보고서 작성
        report = await submitReport({
          type: "daily",
          session: sessionParam || undefined,
          title: data.title,
          content: data.content,
          keywords,
          status: "submitted",
        });
      }

      // 캐시 무효화 (홈 화면에서 새 데이터 표시)
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["report", editId] });
      }

      setSubmittedReport(report);
      if (!isEditMode) {
        clearDraft();
      }

      router.push("/reports/daily/complete");
    } catch (error) {
      console.error("제출 실패:", error);
      Toast.show({
        content: "제출 중 오류가 발생했습니다",
        position: "bottom",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 수정 모드에서 데이터 로딩 중
  if (isEditMode && isLoadingEdit) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader title="보고서 불러오는 중..." />
        <div className="flex justify-center items-center py-20">
          <SpinLoading color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title={isEditMode ? "보고서 수정" : "1일 보고 작성"} />

      {/* 작성 폼 */}
      <div className="px-4 py-4 page-content">
        {/* 날짜 표시 */}
        <div className="text-sm text-gray-500 mb-4">
          {format(today, "yyyy년 M월 d일 EEEE", { locale: ko })}
        </div>

        {/* 빠른 불러오기 버튼 */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTemplateSheetVisible(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium active:bg-blue-100 transition-colors"
          >
            <FileOutline />
            템플릿
          </button>
          <button
            type="button"
            onClick={() => setPreviousSheetVisible(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium active:bg-green-100 transition-colors"
          >
            <HistogramOutline />
            이전 보고
          </button>
        </div>

        {/* 제목 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="보고 제목을 입력하세요"
                clearable
                style={{
                  "--font-size": "16px",
                  "--color": "#111827",
                  "--placeholder-color": "#9ca3af",
                }}
              />
            )}
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* 내용 입력 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              내용
            </label>
            <span className="text-xs text-gray-400">
              {content?.length || 0} / 5000
            </span>
          </div>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                placeholder="오늘의 업무 내용을 작성해주세요"
                rows={12}
                maxLength={5000}
                showCount={false}
                style={{
                  "--font-size": "15px",
                  "--color": "#111827",
                  "--placeholder-color": "#9ca3af",
                }}
              />
            )}
          />
          {errors.content && (
            <p className="text-sm text-red-500 mt-1">
              {errors.content.message}
            </p>
          )}
        </div>
      </div>

      {/* 하단 CTA */}
      <BottomCTA
        buttons={[
          {
            label: "임시 저장",
            onClick: handleSaveDraft,
            type: "default",
          },
          {
            label: isSubmitting ? (isEditMode ? "수정 중..." : "제출 중...") : (isEditMode ? "수정하기" : "제출하기"),
            onClick: handleSubmit(onSubmit),
            type: "primary",
            disabled: !isValid || isSubmitting,
            loading: isSubmitting,
          },
        ]}
      />

      {/* 바텀시트 */}
      <TemplateBottomSheet
        visible={templateSheetVisible}
        onClose={() => setTemplateSheetVisible(false)}
        onSelect={handleTemplateSelect}
      />
      <PreviousReportBottomSheet
        visible={previousSheetVisible}
        onClose={() => setPreviousSheetVisible(false)}
        onSelect={handlePreviousReportSelect}
      />

      {/* 제출 중 로딩 */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3">
            <SpinLoading color="primary" style={{ "--size": "32px" }} />
            <span className="text-gray-700 font-medium">
              AI가 키워드를 추출하고 있어요
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DailyReportNewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <SpinLoading color="primary" />
        </div>
      }
    >
      <DailyReportNewContent />
    </Suspense>
  );
}
