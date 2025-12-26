export type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReportSession = 'AM' | 'PM'; // AM: 출근 보고, PM: 퇴근 보고

export interface Report {
  id: string;
  type: ReportType;
  session?: ReportSession; // 일일 보고의 경우 출근/퇴근 구분
  title: string;
  content: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'submitted';
}

export interface ReportDraft {
  type: ReportType;
  session?: ReportSession;
  title: string;
  content: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
}

export interface PreviousReport {
  id: string;
  title: string;
  content: string;
  date: Date;
  keywords: string[];
}
