# Git Branch & Sync Tool

Git 브랜치 생성 및 동기화 명령어를 자동으로 생성해주는 웹 도구입니다.

## 주요 기능

1. **브랜치 생성 명령어 생성**
   - pre-stage, qa-stage, develop 기반 feature 브랜치를 자동 생성
   - origin에 push하는 명령어까지 포함

2. **Sync 명령어 생성**
   - feature 브랜치의 변경사항을 dev/qa 브랜치로 cherry-pick하는 명령어 생성
   - 서버에서 git log를 실행하여 필요한 커밋 해시를 자동 계산

3. **로컬 브랜치 관리**
   - 로컬 브랜치 목록 조회 (최근 커밋 날짜 순)
   - 선택한 브랜치 삭제 명령어 생성

## 설치 및 실행

### 요구사항

- Node.js 14 이상
- Git

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
PORT=53000
GIT_REPO_PATH=.
```

- `PORT`: 서버 포트 (기본값: 53000)
- `GIT_REPO_PATH`: Git 저장소 경로 (기본값: 현재 디렉토리)

### 실행

```bash
npm start
```

브라우저에서 `http://localhost:53000` (또는 설정한 포트)로 접속하세요.

## 사용법

1. **공통 입력**: 티켓명, 작업명, 사번을 입력합니다.
2. **브랜치 생성**: "브랜치 생성 명령어 만들기" 버튼을 클릭하여 생성된 명령어를 복사해 터미널에서 실행합니다.
3. **Sync**: develop 또는 qa 브랜치에 동기화할 명령어를 생성합니다.
4. **브랜치 관리**: 로컬 브랜치 목록을 불러와 삭제할 브랜치를 선택하고 명령어를 생성합니다.

## 브랜치 명명 규칙

- Base 브랜치: `feature/{티켓명}-{작업명슬러그}-{사번}`
- QA 브랜치: `feature/{티켓명}-{작업명슬러그}-{사번}-qa`
- Develop 브랜치: `feature/{티켓명}-{작업명슬러그}-{사번}-develop`

## 기술 스택

- Node.js
- Express.js
- Vanilla JavaScript

## 라이선스

MIT License

## 기여하기

이슈나 Pull Request를 환영합니다!

