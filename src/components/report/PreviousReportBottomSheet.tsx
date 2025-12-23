"use client";

import { Popup, List } from "antd-mobile";
import { HistogramOutline } from "antd-mobile-icons";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { mockPreviousReports } from "@/lib/mock/data";
import type { PreviousReport } from "@/types/report";

interface PreviousReportBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (report: PreviousReport) => void;
}

export function PreviousReportBottomSheet({
  visible,
  onClose,
  onSelect,
}: PreviousReportBottomSheetProps) {
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
        <List>
          {mockPreviousReports.map((report) => (
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
                onSelect(report);
                onClose();
              }}
              arrow={false}
              className="rounded-lg mb-2"
            >
              <span className="font-medium">
                {format(report.date, "M월 d일 (EEEE)", { locale: ko })}
              </span>
            </List.Item>
          ))}
        </List>
      </div>
    </Popup>
  );
}

