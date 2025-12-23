import { Template, PreviousReport } from "@/types/report";
import { subDays, format } from "date-fns";

// Mock 템플릿 데이터
export const mockTemplates: Template[] = [
  {
    id: "tpl-1",
    name: "일반 업무 보고",
    content: `## 오늘의 업무

### 완료한 업무
- 

### 진행 중인 업무
- 

### 내일 예정
- 

### 이슈/특이사항
- `,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "tpl-2",
    name: "개발 업무 보고",
    content: `## 개발 업무 보고

### 완료
- [ ] 기능 개발:
- [ ] 버그 수정:
- [ ] 코드 리뷰:

### 진행 중
- [ ] 

### 이슈
- 발생한 이슈:
- 해결 방안:

### 내일 계획
- `,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "tpl-3",
    name: "간단 보고",
    content: `[완료]


[진행중]


[예정]

`,
    createdAt: new Date("2024-01-01"),
  },
];

// Mock 이전 보고 데이터
export const mockPreviousReports: PreviousReport[] = [
  {
    id: "prev-1",
    title: format(subDays(new Date(), 1), "M월 d일 업무 보고"),
    content: `## 오늘의 업무

### 완료한 업무
- 신규 기능 개발 완료 (로그인 페이지)
- 코드 리뷰 3건 완료
- 주간 회의 참석

### 진행 중인 업무
- 대시보드 UI 개발 (70% 진행)
- API 연동 테스트

### 내일 예정
- 대시보드 개발 마무리
- QA 테스트 지원

### 이슈/특이사항
- 서버 응답 지연 이슈 발견, 인프라팀 전달 완료`,
    date: subDays(new Date(), 1),
    keywords: ["기능 개발", "코드 리뷰", "회의", "UI 개발", "API 연동"],
  },
  {
    id: "prev-2",
    title: format(subDays(new Date(), 2), "M월 d일 업무 보고"),
    content: `## 오늘의 업무

### 완료한 업무
- 기획서 검토 및 피드백
- DB 스키마 설계
- 팀 미팅 참석

### 진행 중인 업무
- 로그인 페이지 개발

### 내일 예정
- 로그인 기능 완료
- 코드 리뷰

### 이슈/특이사항
- 없음`,
    date: subDays(new Date(), 2),
    keywords: ["기획서 검토", "DB 설계", "미팅", "로그인 개발"],
  },
  {
    id: "prev-3",
    title: format(subDays(new Date(), 3), "M월 d일 업무 보고"),
    content: `## 오늘의 업무

### 완료한 업무
- 프로젝트 킥오프 미팅
- 개발 환경 세팅
- 기술 스택 논의

### 진행 중인 업무
- 기획서 분석

### 내일 예정
- DB 스키마 설계
- 화면 설계서 검토

### 이슈/특이사항
- 프로젝트 일정 확정 필요`,
    date: subDays(new Date(), 3),
    keywords: ["킥오프", "환경 세팅", "기술 스택", "기획 분석"],
  },
];

// 오늘 보고 작성 여부 (Mock)
export const hasTodayReport = (): boolean => {
  // Mock: 50% 확률로 오늘 보고가 있다고 가정
  return false;
};

// 오늘의 Mock 보고 데이터
export const getTodayReport = () => {
  return null; // MVP에서는 항상 작성 필요 상태
};
