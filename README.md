# E-learning Frontend (Public Version)

이 레포지토리는 이러닝 플랫폼의 React 기반 프론트엔드 코드입니다.  
포트폴리오 공개용으로, 실제 실행이 아닌 **구조 및 코드 열람을 목적으로 업로드**되었습니다.

---

## 🌐 실제 배포 주소

👉 [https://your-elearning-domain.com](https://your-elearning-domain.com)

> 이 레포는 실행되지 않으며, **실제 서비스는 위 도메인에서 확인하실 수 있습니다.**

---

## 📌 프로젝트 개요

- **기술 스택**: React, Vite, Axios, TailwindCSS
- **핵심 구현 요소**
  - 사용자/관리자 화면 분리
  - 로그인 및 회원가입 UI
  - 강의 목록, 상세, 수강신청 페이지
  - JWT 기반 API 연동 구조

---

## 🗂 폴더 구조

```
├── app/ # Next.js App Router 구조 폴더
│ ├── page.tsx # 메인 페이지
│ ├── layout.tsx # 공통 레이아웃
│ └── ... # 기타 라우트 관련 파일
├── components/ # 재사용 가능한 컴포넌트 모음
├── hooks/ # 커스텀 React 훅
├── public/ # 정적 파일 (이미지, 아이콘 등)
├── styles/ # 전역 스타일 (Tailwind 등)
├── .gitignore # Git에서 제외할 파일 목록
├── components.json # 컴포넌트 프리셋 정의
├── middleware.ts # Next.js 미들웨어 설정
├── next.config.mjs # Next.js 환경설정
├── package.json # 의존성과 실행 스크립트 정의
├── postcss.config.mjs # PostCSS 설정
├── tailwind.config.js # TailwindCSS 설정 (JS)
├── tailwind.config.ts # TailwindCSS 설정 (TS)
└── tsconfig.json # TypeScript 설정
```

---

## 🔐 보안 및 실행 관련

- `.env` 등 민감한 설정 파일은 **제외되어 있습니다**
- 이 레포는 **실행을 위한 환경 구성이 포함되어 있지 않습니다**
- 실행 목적이 아닌 **코드 확인 및 구조 전달을 위한 용도**입니다

---

## ✅ 공개 목적

이 프로젝트는 다음과 같은 역량을 보여주기 위해 공개되었습니다:

- 실제 서비스 운영에 사용된 프론트엔드 코드 설계 능력
- 컴포넌트 중심 UI 구성 방식
- REST API 연동 및 상태 관리 구조 이해
- 보안 및 GitHub 공개 레포지토리 관리 역량

---

## 🧑‍💻 작성자

- 권나현 (Nahyeon Kwon)  
- GitHub: [knh1721](https://github.com/knh1721)

---

## 📝 License

본 코드는 포트폴리오 열람 목적으로 공개되며, 민감정보와 실행 설정은 포함되지 않습니다.
