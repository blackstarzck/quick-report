"use client";

import { Popup, List, SpinLoading } from "antd-mobile";
import { HistogramOutline } from "antd-mobile-icons";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import type { Report, PreviousReport } from "@/types/report";

interface PreviousReportBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (report: PreviousReport) => void;
}

// API에서 보고서 목록 가져오기
async function fetchReports(): Promise<Report[]> {
  const response = await fetch("/api/reports");
  if (!response.ok) {
    throw new Error("보고서를 불러오는데 실패했습니다.");
  }
  return response.json();
}

// Report를 PreviousReport 형식으로 변환
function toPreviousReport(report: Report): PreviousReport {
  return {
    id: report.id,
    title: report.title,
    content: report.content,
    date: new Date(report.createdAt),
    keywords: report.keywords,
  };
}

export function PreviousReportBottomSheet({
  visible,
  onClose,
  onSelect,
}: PreviousReportBottomSheetProps) {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    enabled: visible, // 팝업이 열릴 때만 데이터 로드
  });

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        minHeight: "40vh",
        maxHeight: "70vh",
      }}
    >
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">이전 보고 불러오기</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <SpinLoading color="primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            이전 보고가 없습니다.
          </div>
        ) : (
          <List>
            {reports.map((report) => (
              <List.Item
                key={report.id}
                prefix={<HistogramOutline className="text-green-500 text-xl" />}
                description={
                  <div className="flex flex-wrap gap-1 mt-1">
                    {report.keywords.slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                }
                onClick={() => {
                  onSelect(toPreviousReport(report));
                  onClose();
                }}
                arrow={false}
                className="rounded-lg mb-2"
              >
                <span className="font-medium">
                  {format(new Date(report.createdAt), "M월 d일 (EEEE)", { locale: ko })}
                </span>
                {report.title && (
                  <span className="text-gray-500 text-sm ml-2">
                    - {report.title}
                  </span>
                )}
              </List.Item>
            ))}
          </List>
        )}
      </div>
    </Popup>
  );
}
