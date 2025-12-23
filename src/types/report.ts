export type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  content: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'submitted';
}

export interface ReportDraft {
  type: ReportType;
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

