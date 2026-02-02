# UsabilityTester

## AI 기반 UX 분석 Figma 플러그인

Figma 디자인에 대한 AI 기반 사용성 테스트 리포트를 즉시 생성합니다. Google Gemini 3.0 Flash 모델을 활용하여 UI/UX 이슈를 자동으로 분석하고 개선 제안을 제공합니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **멀티프레임 분석** | 여러 화면을 순차적으로 분석하여 사용자 여정(Journey) 전체 평가 |
| **페르소나 기반 분석** | 시니어, 신규 사용자 등 다양한 페르소나 관점에서 UX 분석 |
| **시각적 리포트** | Figma 캔버스에 분석 결과를 프레임으로 직접 생성 |
| **Step별 인사이트** | 각 화면(Step)에 대한 관찰(Observation), 사고(Thought), 액션(Action) 제공 |

---

## 🚀 사용 방법

1. **API 키 설정**: [Google AI Studio](https://aistudio.google.com/app/apikey)에서 Gemini API 키 발급
2. **프레임 선택**: Figma에서 분석할 프레임 또는 Section 선택
3. **태스크 입력**: AI가 수행할 태스크 설명 입력 (예: "회원가입 완료하기")
4. **페르소나 설정** (선택): 특정 사용자 유형 지정
5. **분석 실행**: Submit 버튼 클릭 또는 `Cmd/Ctrl + Enter`

---

## 🛠️ 개발자 가이드

### 설치 및 실행

```bash
# 의존성 설치
yarn install

# 개발 모드 빌드 (watch)
yarn build:watch

# 프로덕션 빌드
yarn build
```

### Figma 플러그인 등록

1. Figma > Plugins > Development > Import plugin from manifest...
2. 이 저장소의 `manifest.json` 선택

### 기술 스택

- **Frontend**: React + TypeScript
- **Bundler**: Webpack
- **AI**: Google Gemini 3.0 Flash (Vision)
- **Plugin API**: Figma Plugin API

### 프로젝트 구조

```
src/
├── app/                    # UI (React)
│   ├── components/         # React 컴포넌트
│   └── assets/             # 이미지, 아이콘
├── plugin/                 # Figma Plugin 코드
│   ├── controller.ts       # 메인 로직
│   ├── api.tsx             # AI API 호출
│   ├── config.ts           # 설정 관리
│   ├── sequenceProcessor.ts # 멀티프레임 처리
│   └── utils/              # 유틸리티 함수
│       ├── FigmaUtils.ts   # Figma 노드 생성
│       └── prompts.ts      # AI 프롬프트
└── UsabilityTester.type.tsx # 타입 정의
```

---

## 📋 로드맵

자세한 내용은 [PRD Enhancement Roadmap](./Plan/PRD_Enhancement_Roadmap.md) 참조

| Phase | 기능 | 상태 |
|-------|------|------|
| Phase 1 | 이슈 우선순위, 페르소나 라이브러리, 프롬프트 커스터마이징 | 🔜 예정 |
| Phase 2 | 접근성 분석, 인지 부하 점수, 배치 분석 | 📋 계획 |
| Phase 3 | 다중 모델 지원, PDF/HTML 내보내기, Slack 알림 | 📋 계획 |
| Phase 4 | Jira/Linear 연동, 히트맵 시각화 | 💭 검토 |

---

## 🙏 Acknowledgments

- [AppAgent: Multimodal Agents as Smartphone Users](https://appagent-official.github.io/) - Tencent 연구팀
- Google Gemini API
