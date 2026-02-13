# 해울한의원 자가진단 설문조사 시스템

환자용 자가진단 설문 시스템 + 관리자 대시보드

## 🚀 배포 방법

### 1. Vercel 연결

1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. "New Project" 클릭 → 이 저장소 선택
3. "Import" 클릭

### 2. Neon 데이터베이스 연결

1. Vercel 프로젝트 대시보드 → "Storage" 탭
2. "Create Database" → "Neon" 선택
3. 무료 플랜 선택 후 "Create"
4. `DATABASE_URL`이 자동으로 환경변수에 추가됩니다

### 3. 환경변수 설정

Vercel 프로젝트 Settings → Environment Variables에서 추가:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `ADMIN_PASSWORD` | (원하는 비밀번호) | 관리자 로그인용 |

### 4. 데이터베이스 초기화

배포 후 한 번만 실행:
```
https://your-domain.vercel.app/api/init-db
```

## 📱 사용 방법

### 환자용 (태블릿)
1. 메인 페이지 접속 → 환자 정보 입력
2. 설문 진행 (섹션별 해당없음 체크 가능)
3. 결과 확인

### 관리자용
1. `/admin` 접속
2. 비밀번호 입력
3. 대시보드에서 통계 확인
4. 환자 목록에서 상세 조회, CSV 내보내기

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Database**: Neon Postgres (Vercel 연동)
- **Charts**: Recharts
- **Deployment**: Vercel

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 환자 정보 입력
│   ├── survey/page.tsx       # 설문 진행
│   ├── result/page.tsx       # 결과 표시
│   ├── admin/
│   │   ├── page.tsx          # 관리자 로그인
│   │   └── dashboard/page.tsx # 대시보드
│   └── api/
│       ├── survey/           # 설문 CRUD
│       ├── admin/            # 관리자 API
│       └── init-db/          # DB 초기화
├── components/
│   └── ProgressBar.tsx
└── lib/
    ├── db.ts                 # DB 연결
    └── survey-data.ts        # 설문 문항 데이터
```

## ⚙️ 로컬 개발

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 DATABASE_URL, ADMIN_PASSWORD 설정

# 개발 서버 실행
npm run dev
```

## 📊 설문 항목

총 67개 문항 (여성 전용 6개 포함)

- **기능적 건강**: 소화, 수면, 대변/장, 소변/방광, 수분(땀/부종), 한열, 정신/스트레스, 생리
- **부위별 증상**: 두면부, 흉부, 복부, 사지, 관절/척추

## 🏥 점수 판정 기준

| 환산 점수 | 등급 | 권장 |
|-----------|------|------|
| 0-20 | 양호 | 정기 관리 |
| 21-40 | 경도 | 생활습관 개선 + 한방 치료 |
| 41-60 | 중등도 | 적극적 한방 치료 |
| 61-100 | 중증 | 심층 진료 권장 |
