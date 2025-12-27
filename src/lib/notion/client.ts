function getApiKey() {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error('NOTION_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  return apiKey;
}

export function getDatabaseId() {
  const dbId = process.env.NOTION_DAILY_REPORT_DB_ID;
  if (!dbId) {
    throw new Error('NOTION_DAILY_REPORT_DB_ID 환경변수가 설정되지 않았습니다.');
  }
  return dbId;
}

function getHeaders() {
  return {
    'Authorization': `Bearer ${getApiKey()}`,
    'Notion-Version': process.env.NOTION_VERSION!,
    'Content-Type': 'application/json',
  };
}

// 데이터베이스 쿼리
export async function queryDatabase(databaseId: string, body: object = {}) {
  const response = await fetch(`${process.env.NOTION_API_BASE}/databases/${databaseId}/query`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Notion API 에러: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// 페이지 조회
export async function getPage(pageId: string) {
  const response = await fetch(`${process.env.NOTION_API_BASE}/pages/${pageId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Notion API 에러: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// 페이지 생성
export async function createPage(body: object) {
  const response = await fetch(`${process.env.NOTION_API_BASE}/pages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Notion API 에러: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// 페이지 수정
export async function updatePage(pageId: string, body: object) {
  const response = await fetch(`${process.env.NOTION_API_BASE}/pages/${pageId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Notion API 에러: ${JSON.stringify(error)}`);
  }

  return response.json();
}
