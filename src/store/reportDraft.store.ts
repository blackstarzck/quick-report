import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReportDraft, Report } from "@/types/report";

interface ReportDraftState {
  draft: ReportDraft;
  submittedReport: Report | null;
  setDraft: (draft: Partial<ReportDraft>) => void;
  clearDraft: () => void;
  setSubmittedReport: (report: Report) => void;
  clearSubmittedReport: () => void;
}

const initialDraft: ReportDraft = {
  type: "daily",
  title: "",
  content: "",
};

export const useReportDraftStore = create<ReportDraftState>()(
  persist(
    (set) => ({
      draft: initialDraft,
      submittedReport: null,
      setDraft: (newDraft) =>
        set((state) => ({
          draft: { ...state.draft, ...newDraft },
        })),
      clearDraft: () => set({ draft: initialDraft }),
      setSubmittedReport: (report) => set({ submittedReport: report }),
      clearSubmittedReport: () => set({ submittedReport: null }),
    }),
    {
      name: "report-draft-storage",
    }
  )
);
