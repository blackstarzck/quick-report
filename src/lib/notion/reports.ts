import { queryDatabase, getPage, createPage, updatePage, getDatabaseId } from './client';
import type { Report, ReportType, ReportSession } from '@/types/report';

// 노션 페이지를 Report 타입으로 변환
function pageToReport(page: any): Report {
  const properties = page.properties;

  return {
    id: page.id,
    type: properties.type?.select?.name || 'daily',
    session: properties.session?.select?.name as ReportSession | undefined,
    title: properties.Title?.title?.[0]?.plain_text || properties.title?.title?.[0]?.plain_text || '',
    content: properties.content?.rich_text?.[0]?.plain_text || '',
    keywords: properties.keywords?.multi_select?.map((tag: any) => tag.name) || [],
    createdAt: new Date(page.created_time),
    updatedAt: new Date(page.last_edited_time),
    status: properties.status?.select?.name || 'draft',
  };
}

// 모든 보고서 조회
export async function getReports(): Promise<Report[]> {
  const databaseId = getDatabaseId();

  const response = await queryDatabase(databaseId, {
    sorts: [
      {
        property: 'createdAt',
        direction: 'descending',
      },
    ],
  });

  return response.results.map(pageToReport);
}

// 특정 보고서 조회
export async function getReport(pageId: string): Promise<Report | null> {
  try {
    const page = await getPage(pageId);
    return pageToReport(page);
  } catch {
    return null;
  }
}

// 보고서 생성
export async function createReport(data: {
  type: ReportType;
  session?: ReportSession;
  title: string;
  content: string;
  keywords: string[];
  status?: 'draft' | 'submitted';
}): Promise<Report> {
  const databaseId = getDatabaseId();

  const properties: any = {
    Title: {
      title: [
        {
          text: { content: data.title },
        },
      ],
    },
    type: {
      select: { name: data.type },
    },
    content: {
      rich_text: [
        {
          text: { content: data.content },
        },
      ],
    },
    keywords: {
      multi_select: data.keywords.map((keyword) => ({ name: keyword })),
    },
    status: {
      select: { name: data.status || 'draft' },
    },
  };

  // 일일 보고의 경우 session 필드 추가
  if (data.session) {
    properties.session = {
      select: { name: data.session },
    };
  }

  const response = await createPage({
    parent: { database_id: databaseId },
    properties,
  });

  return pageToReport(response);
}

// 보고서 수정
export async function updateReportData(
  pageId: string,
  data: Partial<{
    type: ReportType;
    session: ReportSession;
    title: string;
    content: string;
    keywords: string[];
    status: 'draft' | 'submitted';
  }>
): Promise<Report> {
  const properties: any = {};

  if (data.title !== undefined) {
    properties.Title = {
      title: [{ text: { content: data.title } }],
    };
  }

  if (data.type !== undefined) {
    properties.type = {
      select: { name: data.type },
    };
  }

  if (data.session !== undefined) {
    properties.session = {
      select: { name: data.session },
    };
  }

  if (data.content !== undefined) {
    properties.content = {
      rich_text: [{ text: { content: data.content } }],
    };
  }

  if (data.keywords !== undefined) {
    properties.keywords = {
      multi_select: data.keywords.map((keyword) => ({ name: keyword })),
    };
  }

  if (data.status !== undefined) {
    properties.status = {
      select: { name: data.status },
    };
  }

  const response = await updatePage(pageId, { properties });
  return pageToReport(response);
}

// 보고서 삭제 (아카이브)
export async function deleteReport(pageId: string): Promise<void> {
  await updatePage(pageId, { archived: true });
}
