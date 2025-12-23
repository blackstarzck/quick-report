/**
 * AI 키워드 자동 추출 Mock 함수
 * 실제 AI API 연동 전까지 사용되는 더미 키워드 추출 로직
 */

// 업무 관련 일반적인 키워드 풀
const KEYWORD_POOL = [
  "프로젝트 진행",
  "회의",
  "문서 작성",
  "코드 리뷰",
  "테스트",
  "배포",
  "버그 수정",
  "기획",
  "디자인",
  "개발",
  "분석",
  "보고서",
  "일정 관리",
  "협업",
  "피드백",
  "리서치",
  "데이터 분석",
  "UI/UX",
  "API 개발",
  "성능 최적화",
];

// 우선순위 키워드 (특정 단어가 포함되면 추출)
const PRIORITY_KEYWORDS: Record<string, string> = {
  회의: "회의",
  미팅: "미팅",
  개발: "개발",
  테스트: "테스트",
  배포: "배포",
  기획: "기획",
  디자인: "디자인",
  분석: "분석",
  리뷰: "리뷰",
  버그: "버그 수정",
  수정: "수정",
  완료: "완료",
  진행: "진행 중",
  예정: "예정",
  협업: "협업",
  문서: "문서화",
  정리: "정리",
  검토: "검토",
  확인: "확인",
  준비: "준비",
};

/**
 * 텍스트에서 키워드를 추출합니다 (Mock)
 * @param content 보고 내용
 * @param maxKeywords 최대 키워드 수 (기본: 7)
 * @returns 추출된 키워드 배열
 */
export function extractKeywords(
  content: string,
  maxKeywords: number = 7
): string[] {
  if (!content || content.trim().length === 0) {
    return [];
  }

  const extractedKeywords: Set<string> = new Set();

  // 1. 우선순위 키워드 추출
  Object.entries(PRIORITY_KEYWORDS).forEach(([trigger, keyword]) => {
    if (content.includes(trigger)) {
      extractedKeywords.add(keyword);
    }
  });

  // 2. 키워드가 부족하면 랜덤으로 추가
  const shuffled = [...KEYWORD_POOL].sort(() => Math.random() - 0.5);
  
  for (const keyword of shuffled) {
    if (extractedKeywords.size >= maxKeywords) break;
    if (!extractedKeywords.has(keyword)) {
      extractedKeywords.add(keyword);
    }
  }

  // 최대 개수만큼 반환
  return Array.from(extractedKeywords).slice(0, maxKeywords);
}

/**
 * 키워드 추출을 시뮬레이션합니다 (로딩 효과용)
 */
export async function extractKeywordsAsync(
  content: string,
  maxKeywords: number = 7
): Promise<string[]> {
  // AI 처리 시간 시뮬레이션 (0.5초 ~ 1.5초)
  const delay = 500 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));
  
  return extractKeywords(content, maxKeywords);
}

