# UsabilityTester 고도화 PRD

> **Product Requirements Document**  
> Version: 1.0  
> Date: 2026-02-02  
> Author: Antigravity AI

---

## 📋 Executive Summary

UsabilityTester는 Figma 플러그인으로, AI 기반 UX 분석을 제공합니다. 이 PRD는 플러그인의 핵심 기능을 강화하고 사용자 경험을 개선하기 위한 로드맵을 정의합니다.

### Vision
> "디자이너가 UX 전문가 수준의 인사이트를 클릭 한 번으로 얻을 수 있도록"

---

## 🎯 Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| 분석 품질 향상 | 사용자 만족도 | 4.5/5 |
| 워크플로우 효율화 | 분석 시간 단축 | -30% |
| 도입 확대 | MAU 증가 | +50% |

---

## 🗺️ Roadmap Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Quick Wins (1-2일)                                             │
│ ├── 이슈 우선순위 표시                                                    │
│ ├── 페르소나 라이브러리                                                    │
│ └── 프롬프트 커스터마이징                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Core Enhancement (3-5일)                                       │
│ ├── 접근성(A11y) 분석                                                     │
│ ├── 인지 부하 점수                                                        │
│ └── 배치 분석                                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Extensibility (1-2주)                                          │
│ ├── 다중 모델 지원                                                        │
│ ├── PDF/HTML 내보내기                                                     │
│ └── Slack 알림                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Advanced (선택)                                                │
│ ├── Jira/Linear 연동                                                     │
│ └── 히트맵 시각화                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Phase 1: Quick Wins

### 1.1 이슈 우선순위 표시

**목적**: 발견된 UX 이슈를 중요도별로 자동 분류

| 항목 | 내용 |
|------|------|
| **Priority** | P0 - Must Have |
| **Effort** | 0.5일 |
| **Dependencies** | None |

**Requirements**:
- [ ] AI 응답에서 이슈 심각도 파싱 (Critical/Major/Minor)
- [ ] 시각적 표시: 🔴 Critical, 🟡 Major, 🟢 Minor
- [ ] 리포트에 심각도별 그룹핑

**Technical Approach**:
```typescript
// prompts.ts 수정
// AI에게 이슈 분류 지시 추가
"각 이슈를 다음 기준으로 분류하세요:
- 🔴 Critical: 태스크 완료 불가능
- 🟡 Major: 사용성 저하
- 🟢 Minor: 개선 권장"
```

---

### 1.2 페르소나 라이브러리

**목적**: 자주 사용하는 페르소나를 저장하고 재사용

| 항목 | 내용 |
|------|------|
| **Priority** | P0 - Must Have |
| **Effort** | 1일 |
| **Dependencies** | None |

**Requirements**:
- [ ] 페르소나 저장 기능 (최대 10개)
- [ ] 저장된 페르소나 목록 드롭다운
- [ ] 삭제/수정 기능
- [ ] 기본 페르소나 템플릿 제공

**Technical Approach**:
```typescript
// figma.clientStorage 활용
await figma.clientStorage.setAsync('personas', personaList);
const personas = await figma.clientStorage.getAsync('personas');
```

**UI Mockup**:
```
┌─────────────────────────────────────┐
│ 페르소나 선택 ▼                       │
├─────────────────────────────────────┤
│ ⭐ 시니어 사용자 (65세 이상)           │
│ ⭐ 신규 가입자                        │
│ ⭐ 파워 유저                          │
│ ───────────────────                 │
│ + 새 페르소나 추가                     │
└─────────────────────────────────────┘
```

---

### 1.3 프롬프트 커스터마이징

**목적**: 분석 관점을 사용자가 직접 설정

| 항목 | 내용 |
|------|------|
| **Priority** | P1 - Should Have |
| **Effort** | 0.5일 |
| **Dependencies** | None |

**Requirements**:
- [ ] 분석 초점 선택 (다중 선택 가능)
  - 접근성
  - 정보 구조
  - 시각 디자인
  - 마이크로인터랙션
  - 에러 처리
- [ ] 설정 저장/불러오기

---

## 📦 Phase 2: Core Enhancement

### 2.1 접근성(A11y) 분석

**목적**: WCAG 기준 접근성 자동 검사

| 항목 | 내용 |
|------|------|
| **Priority** | P1 - Should Have |
| **Effort** | 2일 |
| **Dependencies** | Phase 1 완료 |

**Requirements**:
- [ ] 색상 대비 검사 (WCAG AA/AAA)
- [ ] 터치 타겟 크기 검사 (최소 44x44px)
- [ ] 텍스트 크기 검사 (최소 16px)
- [ ] 결과를 별도 섹션으로 리포트

**Technical Approach**:
```typescript
function checkColorContrast(fg: RGB, bg: RGB): number {
  // WCAG 2.1 contrast ratio calculation
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
```

---

### 2.2 인지 부하 점수

**목적**: 화면별 인지 부하 자동 측정

| 항목 | 내용 |
|------|------|
| **Priority** | P2 - Nice to Have |
| **Effort** | 1일 |
| **Dependencies** | None |

**Metrics**:
- UI 요소 개수
- 텍스트 밀도
- 색상 다양성
- 시각적 계층 깊이

---

### 2.3 배치 분석

**목적**: 여러 플로우를 한 번에 분석

| 항목 | 내용 |
|------|------|
| **Priority** | P1 - Should Have |
| **Effort** | 2일 |
| **Dependencies** | Phase 1 완료 |

**Requirements**:
- [ ] 여러 Section 동시 선택 지원
- [ ] 순차 분석 (Rate Limit 고려)
- [ ] 종합 리포트 생성
- [ ] 진행 상황 표시

---

## 📦 Phase 3: Extensibility

### 3.1 다중 모델 지원

**목적**: Claude, GPT-4V 등 다른 Vision 모델 선택

| 항목 | 내용 |
|------|------|
| **Priority** | P2 - Nice to Have |
| **Effort** | 3일 |
| **Dependencies** | None |

**Supported Models**:
- Gemini 3.0 Flash (현재)
- Claude 3.5 Sonnet
- GPT-4 Vision

---

### 3.2 PDF/HTML 내보내기

**목적**: 분석 결과를 외부 공유 가능한 형식으로 내보내기

| 항목 | 내용 |
|------|------|
| **Priority** | P2 - Nice to Have |
| **Effort** | 3일 |
| **Dependencies** | None |

**Approach**:
- HTML: Figma 캔버스 수동 캡처 + 템플릿 생성
- PDF: html2pdf.js 라이브러리 활용

---

### 3.3 Slack 알림

**목적**: 분석 완료 시 Slack으로 결과 요약 전송

| 항목 | 내용 |
|------|------|
| **Priority** | P3 - Optional |
| **Effort** | 0.5일 |
| **Dependencies** | None |

**Requirements**:
- [ ] Slack Webhook URL 설정
- [ ] 분석 완료 시 자동 알림
- [ ] 요약 메시지 포맷팅

---

## 📦 Phase 4: Advanced

### 4.1 Jira/Linear 연동

**목적**: 발견된 이슈를 티켓으로 자동 생성

| 항목 | 내용 |
|------|------|
| **Priority** | P3 - Optional |
| **Effort** | 5일 |
| **Dependencies** | 외부 OAuth 인증 필요 |

---

### 4.2 히트맵 시각화

**목적**: 탭/클릭 위치를 히트맵으로 시각화

| 항목 | 내용 |
|------|------|
| **Priority** | P3 - Optional |
| **Effort** | 5일 |
| **Dependencies** | 커스텀 렌더링 로직 필요 |

---

## 🚫 Out of Scope

다음 기능은 이번 로드맵에서 제외:

| 기능 | 제외 사유 |
|------|----------|
| 개선 전후 모킹 | AI가 Figma 노드를 직접 생성하는 것은 기술적으로 매우 복잡 |
| Mobbin 벤치마킹 | Mobbin API가 공개되지 않음 |
| 디자인 시스템 검증 | 디자인 토큰 추출 + 비교 로직 복잡도 높음 |

---

## 📊 Timeline Summary

| Phase | Duration | Features | Start |
|-------|----------|----------|-------|
| Phase 1 | 1-2일 | 3개 | 즉시 시작 가능 |
| Phase 2 | 3-5일 | 3개 | Phase 1 완료 후 |
| Phase 3 | 1-2주 | 3개 | Phase 2 완료 후 |
| Phase 4 | TBD | 2개 | 선택적 |

---

## ✅ Next Steps

1. Phase 1 구현 착수 (이슈 우선순위 표시부터)
2. 주간 진행 상황 리뷰
3. 사용자 피드백 수집 및 우선순위 조정

---

## 📎 Appendix: Future Consideration (도전적 기능)

> ⚠️ 아래 기능들은 기술적 복잡도가 높거나 외부 의존성이 있어 **추후 검토** 대상입니다.  
> 로드맵 완료 후 리소스와 우선순위를 재평가하여 구현 여부를 결정합니다.

---

### A.1 개선 전후 UI 모킹 (AI-Generated Redesign)

**목적**: AI가 UX 이슈를 발견하면 개선된 UI를 자동 생성하여 비교

| 항목 | 내용 |
|------|------|
| **Effort** | 2-3주 |
| **Difficulty** | ⭐⭐⭐⭐⭐ |
| **Feasibility** | ❓ 불확실 |

**왜 어려운가**:
- AI가 Figma 노드 구조를 이해하고 생성해야 함
- 스타일, 레이아웃, 컴포넌트 일관성 유지 필요
- 현재 Vision 모델은 이미지 → 코드는 가능하나, 이미지 → Figma 노드는 미지원

**가능한 대안**:
1. AI가 개선 제안을 **텍스트**로 제공 (현재 방식)
2. AI가 개선된 UI를 **이미지로 생성** (DALL-E/Midjourney)
3. Code Connect로 기존 컴포넌트 재조합

**구현 시 필요 조건**:
- [ ] Figma 노드 역직렬화 로직 개발
- [ ] AI 모델이 Figma JSON 스펙을 이해하도록 프롬프트 엔지니어링
- [ ] 생성된 노드 검증 및 오류 처리

---

### A.2 Mobbin 경쟁사 벤치마킹

**목적**: Mobbin 데이터를 활용하여 유사 앱과 UX 패턴 비교

| 항목 | 내용 |
|------|------|
| **Effort** | 3-4주 |
| **Difficulty** | ⭐⭐⭐⭐ |
| **Feasibility** | ❌ 외부 의존 |

**왜 어려운가**:
- Mobbin은 공개 API를 제공하지 않음
- 스크래핑은 이용약관 위반 가능성
- 데이터 저작권 이슈

**가능한 대안**:
1. **수동 비교**: 사용자가 Mobbin 스크린샷을 직접 업로드
2. **자체 DB 구축**: 오픈 소스 앱 스크린샷 수집
3. **Mobbin 파트너십**: 공식 API 접근 협의

**구현 시 필요 조건**:
- [ ] Mobbin 공식 API 출시 또는 파트너십
- [ ] 유사도 측정 알고리즘 (Vision Embedding 활용)
- [ ] 카테고리별 벤치마크 DB

---

### A.3 디자인 시스템 일관성 검증

**목적**: 컴포넌트, 색상, 타이포그래피가 디자인 시스템과 일치하는지 검증

| 항목 | 내용 |
|------|------|
| **Effort** | 2-3주 |
| **Difficulty** | ⭐⭐⭐⭐ |
| **Feasibility** | ⚠️ 조건부 가능 |

**왜 어려운가**:
- 디자인 토큰 추출 로직 필요 (Variables, Styles API)
- 다양한 디자인 시스템 포맷 대응 (Figma Tokens, Style Dictionary)
- 컴포넌트 인스턴스 vs 커스텀 요소 구분

**가능한 대안**:
1. **Figma Variables 활용**: Figma의 공식 Variables API로 토큰 추출
2. **Design Lint 연동**: 기존 플러그인(Design Lint)과 통합
3. **규칙 기반 검사**: 사용자가 직접 규칙 정의

**구현 시 필요 조건**:
- [ ] Figma Variables/Styles API 심층 연구
- [ ] 디자인 시스템 스키마 정의
- [ ] 비교 알고리즘 및 리포팅 UI

---

### A.4 비교 분석 (A/B 테스트 지원)

**목적**: 2개 플로우를 비교 분석하여 어떤 디자인이 더 우수한지 평가

| 항목 | 내용 |
|------|------|
| **Effort** | 1-2주 |
| **Difficulty** | ⭐⭐⭐ |
| **Feasibility** | ✅ 가능 |

**왜 도전적인가**:
- 2개 플로우의 화면을 1:1 매칭하는 로직 필요
- 비교 프롬프트 설계 복잡
- 결과 시각화 UI 개발

**구현 접근법**:
```typescript
// 2개 Section 선택 → 화면별 비교
const [flowA, flowB] = selectedSections;
const comparison = await compareFlows(flowA, flowB);
// 결과: 각 화면별 승자 + 종합 점수
```

**구현 시 필요 조건**:
- [ ] 2개 플로우 동시 선택 UI
- [ ] 화면 매칭 알고리즘 (이름 기반 또는 순서 기반)
- [ ] 비교 결과 리포트 생성

---

### A.5 히트맵 시각화

**목적**: 탭/클릭 위치를 히트맵으로 시각화하여 사용자 주목 영역 파악

| 항목 | 내용 |
|------|------|
| **Effort** | 1주 |
| **Difficulty** | ⭐⭐⭐ |
| **Feasibility** | ✅ 가능 |

**왜 도전적인가**:
- Figma에서 그라데이션/반투명 원을 여러 개 생성해야 함
- AI가 제공하는 탭 좌표를 기반으로 히트맵 생성
- 성능 최적화 필요 (많은 노드 생성 시)

**구현 접근법**:
```typescript
function createHeatmapPoint(x: number, y: number, intensity: number): EllipseNode {
  const point = figma.createEllipse();
  point.resize(60, 60);
  point.x = x - 30;
  point.y = y - 30;
  point.fills = [{
    type: 'SOLID',
    color: { r: 1, g: 0, b: 0 },
    opacity: intensity * 0.3 // 투명도로 강도 표현
  }];
  return point;
}

// 여러 탭 위치를 오버레이로 표시
actions.forEach(action => {
  if (action.type === 'tap') {
    heatmapLayer.appendChild(createHeatmapPoint(action.x, action.y, 1));
  }
});
```

**구현 시 필요 조건**:
- [ ] AI 응답에서 탭 좌표 추출 로직
- [ ] 히트맵 레이어 생성 및 관리
- [ ] 색상 그라데이션 (빨강 → 노랑 → 초록)
- [ ] 토글 on/off UI

---

### A.6 실시간 협업 코멘트

**목적**: 분석 결과에 팀원이 코멘트하고 토론

| 항목 | 내용 |
|------|------|
| **Effort** | 3-4주 |
| **Difficulty** | ⭐⭐⭐⭐⭐ |
| **Feasibility** | ⚠️ 외부 인프라 필요 |

**왜 어려운가**:
- Figma 플러그인은 로컬 실행 → 실시간 동기화 불가
- 별도 백엔드 서버 + 실시간 DB (Firebase, Supabase) 필요
- 사용자 인증 및 권한 관리

**가능한 대안**:
1. **Figma 코멘트 활용**: 분석 결과를 Figma 코멘트로 생성
2. **외부 링크**: Notion/Slack으로 리다이렉트

**구현 시 필요 조건**:
- [ ] 백엔드 서버 구축 (Node.js + Firebase/Supabase)
- [ ] 사용자 인증 (Figma OAuth)
- [ ] 실시간 동기화 로직

---

## 📋 Appendix 기능 평가 매트릭스

| 기능 | Effort | Impact | Feasibility | 추천 |
|------|--------|--------|-------------|------|
| A.1 UI 모킹 | 2-3주 | ⭐⭐⭐⭐⭐ | ❓ | 🔬 R&D |
| A.2 Mobbin 벤치마킹 | 3-4주 | ⭐⭐⭐⭐ | ❌ | ⏸️ 보류 |
| A.3 디자인 시스템 검증 | 2-3주 | ⭐⭐⭐ | ⚠️ | 🔬 R&D |
| A.4 비교 분석 | 1-2주 | ⭐⭐⭐⭐ | ✅ | ✅ Phase 5 후보 |
| A.5 히트맵 시각화 | 1주 | ⭐⭐⭐⭐ | ✅ | ✅ Phase 5 후보 |
| A.6 협업 코멘트 | 3-4주 | ⭐⭐⭐ | ⚠️ | ⏸️ 보류 |

---

## 🎯 결정 기준

Appendix 기능 구현 여부는 다음 기준으로 결정:

1. **Phase 1-4 완료 후** 리소스 여유 확인
2. **사용자 피드백**에서 해당 기능 요청 빈도
3. **기술적 돌파구** 발생 시 (예: AI 모델 발전, Mobbin API 출시)
4. **비즈니스 임팩트** 대비 투자 가치

---

*Document End*
