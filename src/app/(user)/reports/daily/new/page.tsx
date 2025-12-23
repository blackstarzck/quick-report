"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextArea, Input, Toast, SpinLoading } from "antd-mobile";
import { FileOutline, HistogramOutline } from "antd-mobile-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { PageHeader } from "@/components/layout/PageHeader";
import { BottomCTA } from "@/components/layout/BottomCTA";
import { TemplateBottomSheet } from "@/components/report/TemplateBottomSheet";
import { PreviousReportBottomSheet } from "@/components/report/PreviousReportBottomSheet";
import { useReportDraftStore } from "@/store/reportDraft.store";
import { reportFormSchema, type ReportFormData } from "@/lib/validators/report";
import { extractKeywordsAsync } from "@/lib/keywords/extractor";
import type { Template, PreviousReport, Report } from "@/types/report";

function DailyReportNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { draft, setDraft, clearDraft, setSubmittedReport } =
    useReportDraftStore();

  const [templateSheetVisible, setTemplateSheetVisible] = useState(false);
  const [previousSheetVisible, setPreviousSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();
  const defaultTitle = format(today, "M월 d일 업무 보고", { locale: ko });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
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

  // 초안 자동 저장
  useEffect(() => {
    setDraft({ title, content });
  }, [title, content, setDraft]);

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
      // AI 키워드 추출 (Mock)
      const keywords = await extractKeywordsAsync(data.content);

      // 보고서 생성
      const report: Report = {
        id: `report-${Date.now()}`,
        type: "daily",
        title: data.title,
        content: data.content,
        keywords,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "submitted",
      };

      setSubmittedReport(report);
      clearDraft();

      router.push("/reports/daily/complete");
    } catch {
      Toast.show({
        content: "제출 중 오류가 발생했습니다",
        position: "bottom",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="1일 보고 작성" />

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
            label: isSubmitting ? "제출 중..." : "제출하기",
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
