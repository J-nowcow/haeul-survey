# 해울한의원 자가진단 - 원본 HTML 기반 개편 체크리스트

## PRD 일치 확인
- [✅] 프로젝트 개요 & 타겟 디바이스 (태블릿 PWA) 확인
- [✅] 화면 흐름 (Intro → 설문 2섹션 → 결과 분석 → 최종 완료) 확인
- [✅] 점수 산출 공식: Math.round((획득총점 / 전체만점) * 100) 확인
- [✅] 4단계 판정 기준 (≤30/≤50/≤80/>80) + needsInDepth 분기 확인
- [✅] 설문 문항 텍스트 & 배점 (원본 HTML과 PRD 일치) 확인
- [✅] 디자인 시스템 (NanumSquareRound, haeul 팔레트, lucide-react) 확인
- [✅] DB 스키마 요구사항 (기존 PostgreSQL 스키마로 커버 가능) 확인

## 구현 체크리스트

### Step 1: 패키지 설치
- [✅] lucide-react 설치

### Step 2: 글로벌 스타일 (`src/app/globals.css`)
- [✅] 색상 변수 haeul 팔레트로 교체
- [✅] @theme inline 블록에 haeul 색상 등록
- [✅] 폰트 NanumSquareRound 적용
- [✅] 스크롤바 숨김
- [✅] btn-press 액티브 효과 추가
- [✅] body 배경/텍스트 색상 변경
- [✅] 불필요한 체크박스/버튼/카드 CSS 클래스 정리

### Step 3: 레이아웃 (`src/app/layout.tsx`)
- [✅] NanumSquareRound CDN 링크 추가
- [✅] themeColor #fbfaf8로 변경
- [✅] statusBarStyle black-translucent

### Step 4: 설문 데이터 (`src/lib/survey-data.ts`)
- [✅] 인터페이스 변경 (SurveySection/SurveyCategory/QUESTIONS 구조)
- [✅] 원본 문항 텍스트 & 점수 정확히 복사 (13개 카테고리)
- [✅] 등급 판정 함수 변경 (기준 + needsInDepth + treatments)
- [✅] 기존 호환용 유틸 함수 유지 (surveySections, getGrade)

### Step 5: 인트로 페이지 (`src/app/page.tsx`)
- [✅] 디자인 원본과 동일하게 변경
- [✅] 성별 select 드롭다운 (기본값 female)
- [✅] 유효성: 이름만 필수
- [✅] ArrowRight 아이콘 버튼

### Step 6: 설문 페이지 (`src/app/survey/page.tsx`)
- [✅] 2탭 기반 UI로 완전 재작성
- [✅] 헤더 (환자 이름 + 실시간 점수 + 탭 바)
- [✅] 카테고리별 카드 + 질문 그리드 (md:2열)
- [✅] 질문 선택 UI (딥그린 배경 + CheckCircle2)
- [✅] 여성 전용 카테고리(생리) 필터링
- [✅] 하단 고정 버튼 (다음 단계 / 결과 분석하기)
- [✅] lucide-react 아이콘 적용

### Step 7: 결과 페이지 (`src/app/result/page.tsx`)
- [✅] 딥그린 헤더 (점수/등급)
- [✅] 상태 분석 카드
- [✅] 권장 치료 리스트
- [✅] needsInDepth=true: 심층검사 안내 (6종 아이콘 그리드) + 동의 버튼
- [✅] needsInDepth=false: 일반 접수 버튼
- [✅] final 화면 (심층 접수 완료 / 일반 접수 완료)
- [✅] 처음으로 돌아가기 기능

### Step 8: 관리자 호환성
- [✅] stats API 등급 기준 변경 (초기관리/적극치료/집중치료/심화치료)
- [✅] dashboard GRADE_COLORS 매핑 추가 (신규+기존 등급명 호환)
- [✅] CSS 변수 참조 haeul-800으로 통일
- [✅] card/btn CSS 클래스 인라인으로 교체

### Step 9: 정리
- [✅] ProgressBar.tsx 삭제
- [✅] manifest.json 색상 변경

### Step 10: 검증
- [✅] npm run build 성공 확인
- [✅] npm run dev 로컬 실행 확인 (2026-02-14 테스트 완료)
- [✅] 전체 플로우 테스트 (인트로 → 설문 → 결과 → 완료)
- [✅] 여성/남성 성별별 카테고리 필터링 확인 (코드 검증 완료)
- [✅] 관리자 대시보드 정상 표시 확인 (등급명 호환 코드 확인)

### Step 11: 관리자 페이지 개선 (2026-02-14)
- [✅] DB 스키마 변경: phone_last4 VARCHAR(4) → phone VARCHAR(20)
- [✅] 기존 데이터 마이그레이션: 010-0000-{기존값} 형태로 업데이트
- [✅] 인트로 페이지: 전화번호 전체 입력 (010-1234-5678 자동 포맷팅)
- [✅] API 필드명 변경: phone_last4 → phone (route.ts, [id]/route.ts)
- [✅] 결과 페이지: phoneLast4 → phone 변경
- [✅] 영역별 점수 한국어 매핑 (CATEGORY_NAME_MAP export)
- [✅] 관리자 상세 모달: 영어 카테고리명 → 한국어 표시
- [✅] 관리자 상세 모달: 설문 원본 보기 UI (접기/펼치기)
- [✅] 관리자 상세 모달: 환자 정보 수정 기능 (수정하기 버튼 → 편집 모드)
- [✅] 관리자 상세 모달: 환자 삭제 기능
- [✅] API: PUT /api/survey/[id] 환자 정보 수정
- [✅] API: DELETE /api/survey/[id] 환자 삭제
- [✅] CSV 내보내기: 전체 전화번호 표시
- [✅] 환자 목록 테이블: 전체 전화번호 표시
