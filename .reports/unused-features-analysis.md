# 미사용 Features 분석 보고서

> **분석일**: 2026-02-06  
> **대상**: `/src/plugin/features/`  
> **현재 사용 중인 기능**: `gazeFlow.ts`만 controller에 연결됨

---

## 📊 Executive Summary

| Phase | 기능 모듈 | 상태 | 우선순위 |
|-------|---------|------|---------|
| Phase 1 | `issuePriority.ts` | ❌ 미연결 | 🔴 HIGH |
| Phase 1 | `personaLibrary.ts` | ❌ 미연결 | 🟡 MEDIUM |
| Phase 1 | `promptCustomization.ts` | ❌ 미연결 | 🟡 MEDIUM |
| Phase 2 | `accessibility.ts` | ❌ 미연결 | 🔴 HIGH |
| Phase 2 | `cognitiveLoad.ts` | ❌ 미연결 | 🟡 MEDIUM |
| Phase 2 | `batchAnalysis.ts` | ❌ 미연결 | 🟢 LOW |
| Phase 3 | `multiModel.ts` | ✅ **사용 중** | - |
| Phase 3 | `export.ts` | ❌ 미연결 | 🟡 MEDIUM |
| Phase 3 | `slack.ts` | ❌ 미연결 | 🟢 LOW |
| Phase 4 | `heatmap.ts` | ❌ 미연결 | 🟡 MEDIUM |
| Phase 4 | `gazeFlow.ts` | ✅ **사용 중** | - |

**결과**: 12개 기능 중 **2개만 사용 중**, **10개 미연결**

---

## 🔴 HIGH Priority: 즉시 통합 권장

### 1. Issue Priority (`issuePriority.ts`)

**기능**: AI 응답에서 이슈를 파싱하고 우선순위별로 분류

**주요 함수**:
```typescript
parseIssuePriority(text: string): IssuePriority
getPriorityEmoji(priority: IssuePriority): string
categorizeIssuesByPriority(issues: Issue[]): CategorizedIssues
parseIssuesFromResponse(response: string): Issue[]
```

**사용 사례**:
- AI가 발견한 이슈를 CRITICAL/MAJOR/MINOR로 자동 분류
- 우선순위별 이모지 표시 (🔴/🟡/🟢)
- 이슈 카테고리별 그룹화

**통합 방법**:
```typescript
// controller.ts에서
import { parseIssuesFromResponse, categorizeIssuesByPriority } from './features/issuePriority';

// AI 응답 파싱 후
const issues = parseIssuesFromResponse(aiResponse);
const categorized = categorizeIssuesByPriority(issues);

// Figma 프레임에 우선순위별로 표시
createIssueFrame(categorized.critical, '🔴 Critical Issues');
createIssueFrame(categorized.major, '🟡 Major Issues');
createIssueFrame(categorized.minor, '🟢 Minor Issues');
```

---

### 2. Accessibility (`accessibility.ts`)

**기능**: WCAG 기반 접근성 자동 검사

**주요 함수**:
```typescript
calculateContrastRatio(fg, bg): number
checkColorContrast(fg, bg): ColorContrastResult
checkTouchTarget(width, height): TouchTargetResult
checkTextSize(fontSize): { passes, recommendation }
calculateAccessibilityScore(report): number
```

**사용 사례**:
- 색상 대비 비율 계산 (WCAG AA/AAA 준수 여부)
- 터치 타겟 크기 검증 (최소 44x44px)
- 텍스트 크기 검증 (최소 12px, 권장 16px)
- 접근성 점수 자동 계산 (0-100)

**통합 방법**:
```typescript
// controller.ts에서
import { checkColorContrast, checkTouchTarget, checkTextSize, calculateAccessibilityScore } from './features/accessibility';

// elemList에서 UI 요소 분석
const accessibilityReport = {
  colorContrast: elemList.map(elem => 
    checkColorContrast(elem.foreground, elem.background)
  ),
  touchTargets: elemList.filter(elem => elem.interactive).map(elem =>
    checkTouchTarget(elem.bbox.width, elem.bbox.height)
  ),
  textSizes: elemList.filter(elem => elem.type === 'TEXT').map(elem =>
    checkTextSize(elem.fontSize)
  ),
};

const score = calculateAccessibilityScore(accessibilityReport);
// Figma 프레임에 접근성 점수 표시
```

---

## 🟡 MEDIUM Priority: 단계적 통합

### 3. Persona Library (`personaLibrary.ts`)

**기능**: 페르소나 저장/불러오기/관리

**주요 함수**:
```typescript
savePersonas(personas: Persona[]): Promise<void>
loadPersonas(): Promise<Persona[]>
deletePersona(id: string): Promise<void>
addPersona(persona: Persona): Promise<void>
```

**통합 방법**:
- UI에 페르소나 드롭다운 추가
- `figma.clientStorage`에 저장된 페르소나 목록 표시
- 자주 사용하는 페르소나 빠른 선택

---

### 4. Prompt Customization (`promptCustomization.ts`)

**기능**: 프롬프트 포커스 영역 커스터마이징

**주요 함수**:
```typescript
buildFocusPromptSection(settings: PromptSettings): string
savePromptSettings(settings: PromptSettings): Promise<void>
loadPromptSettings(): Promise<PromptSettings>
getDefaultFocusAreas(): AnalysisFocus[]
```

**포커스 옵션**:
- Accessibility (접근성)
- Visual Hierarchy (시각적 계층)
- Cognitive Load (인지 부하)
- Emotional Response (감정 반응)
- Task Completion (작업 완료)

**통합 방법**:
- UI에 분석 포커스 체크박스 추가
- 선택된 포커스에 따라 프롬프트 동적 생성

---

### 5. Cognitive Load (`cognitiveLoad.ts`)

**기능**: UI 복잡도 및 인지 부하 측정

**주요 함수**:
```typescript
calculateCognitiveLoad(metrics: CognitiveLoadMetrics): CognitiveLoadResult
getCognitiveLoadEmoji(level): string
extractMetricsFromNode(nodeJson): CognitiveLoadMetrics
```

**측정 지표**:
- 요소 수 (elementCount)
- 상호작용 요소 수 (interactiveElementCount)
- 텍스트 밀도 (textDensity)
- 색상 다양성 (colorVariety)
- 계층 깊이 (hierarchyDepth)

**통합 방법**:
```typescript
// elemList에서 메트릭 추출
const metrics = {
  elementCount: elemList.length,
  interactiveElementCount: elemList.filter(e => e.interactive).length,
  textDensity: elemList.filter(e => e.type === 'TEXT').reduce((sum, e) => sum + e.text.length, 0),
  colorVariety: new Set(elemList.map(e => e.color)).size,
  hierarchyDepth: Math.max(...elemList.map(e => e.depth)),
};

const result = calculateCognitiveLoad(metrics);
// 결과: { score: 1-10, level: 'LOW'|'MEDIUM'|'HIGH', recommendations }
```

---

### 6. Export (`export.ts`)

**기능**: HTML/Markdown 보고서 생성 및 다운로드

**주요 함수**:
```typescript
generateHtmlReport(title, sections, options): string
generateMarkdownReport(title, sections, options): string
downloadFile(content, filename, mimeType): void
exportReport(title, sections, options): string
```

**통합 방법**:
- UI에 "Export Report" 버튼 추가
- 분석 결과를 ReportSection 형식으로 변환
- HTML 또는 Markdown 형식으로 다운로드

---

### 7. Heatmap (`heatmap.ts`)

**기능**: 터치/클릭 위치 히트맵 시각화

**주요 함수**:
```typescript
createHeatmapPoint(position, config): EllipseNode
createHeatmapLayer(positions, parentNode, config): FrameNode
parseTapPositionsFromResponse(response, frameWidth, frameHeight): TapPosition[]
toggleHeatmapVisibility(parent, visible): void
removeHeatmapLayers(parent): void
```

**통합 방법**:
```typescript
// AI 응답에서 tap 위치 파싱
const tapPositions = parseTapPositionsFromResponse(aiResponse, frameWidth, frameHeight);

// 히트맵 레이어 생성
const heatmapLayer = createHeatmapLayer(tapPositions, labeledActionFrame);
labeledActionFrame.appendChild(heatmapLayer);
```

---

## 🟢 LOW Priority: 선택적 통합

### 8. Batch Analysis (`batchAnalysis.ts`)

**기능**: 다중 프레임 순차 분석

**주요 함수**:
```typescript
createBatchItems(nodes): BatchItem[]
calculateProgress(items, startTime): BatchProgress
processBatchSequentially(items, processor, onProgress, rateLimitMs): Promise<BatchResult>
withRateLimit(fn, minDelayMs): Promise<T>
```

**통합 방법**:
- 여러 프레임 선택 시 배치 분석 모드 활성화
- 진행률 표시 (percentage, estimatedTimeRemaining)
- Rate limiting으로 API 과부하 방지

---

### 9. Slack (`slack.ts`)

**기능**: Slack Webhook을 통한 분석 결과 알림

**주요 함수**:
```typescript
saveWebhookUrl(url): Promise<void>
loadWebhookUrl(): Promise<string | null>
buildSlackMessage(title, score, issues, summary): SlackMessage
sendToSlack(webhookUrl, message): Promise<boolean>
notifySlack(title, score, issues, summary): Promise<boolean>
```

**통합 방법**:
- UI에 Slack Webhook URL 설정 추가
- 분석 완료 후 자동 알림 옵션
- 이슈 우선순위별 색상 구분 (🔴🟡🟢)

---

## 🚀 통합 로드맵

### Phase 1: Quick Wins (1주)
1. ✅ **Issue Priority** 통합
   - AI 응답 파싱 로직 추가
   - 우선순위별 프레임 생성
2. ✅ **Accessibility** 통합
   - elemList 분석 로직 추가
   - 접근성 점수 표시

### Phase 2: Core Enhancement (2주)
3. ✅ **Cognitive Load** 통합
   - 메트릭 추출 로직 구현
   - 복잡도 점수 표시
4. ✅ **Heatmap** 통합
   - tap 위치 파싱 로직 추가
   - 히트맵 레이어 생성

### Phase 3: Extensibility (1주)
5. ✅ **Export** 통합
   - UI에 Export 버튼 추가
   - HTML/Markdown 생성 로직 연결
6. ✅ **Persona Library** 통합
   - UI에 페르소나 드롭다운 추가
   - 저장/불러오기 기능 연결

### Phase 4: Optional (선택)
7. ⏸️ **Batch Analysis** (필요 시)
8. ⏸️ **Slack** (필요 시)
9. ⏸️ **Prompt Customization** (필요 시)

---

## 📝 권장 사항

### 즉시 조치
1. **Issue Priority** 통합 (가장 높은 가치)
   - 현재 AI 응답에 이슈가 포함되어 있지만 분류되지 않음
   - 우선순위별 분류로 디자이너의 작업 효율 크게 향상

2. **Accessibility** 통합 (WCAG 준수)
   - 접근성은 필수 요구사항
   - 자동 검사로 수동 검증 시간 절약

### 단계적 조치
3. **Cognitive Load** + **Heatmap** 조합
   - 복잡도 분석과 시각화를 함께 제공
   - 사용자 행동 패턴 이해 향상

4. **Export** 기능
   - 분석 결과 공유 필요성 증가 시 통합
   - 팀 협업 및 보고서 작성 지원

### 선택적 조치
5. **Batch Analysis**, **Slack**, **Prompt Customization**
   - 사용자 피드백에 따라 필요 시 통합
   - 현재는 우선순위 낮음

---

## 🔧 통합 예시 코드

### controller.ts 수정 예시

```typescript
// 1. Import 추가
import { parseIssuesFromResponse, categorizeIssuesByPriority } from './features/issuePriority';
import { checkColorContrast, checkTouchTarget, calculateAccessibilityScore } from './features/accessibility';
import { calculateCognitiveLoad } from './features/cognitiveLoad';

// 2. AI 응답 파싱 후 (createHolisticReportResult 함수 내)
async function createHolisticReportResult(data: string, taskFrameId: string, result: SequenceStepResult[]) {
  // ... 기존 코드 ...
  
  // 🆕 Issue Priority 분석
  const issues = parseIssuesFromResponse(data);
  const categorized = categorizeIssuesByPriority(issues);
  
  // 🆕 Accessibility 분석
  const accessibilityReport = {
    colorContrast: elemList.map(elem => checkColorContrast(elem.fg, elem.bg)),
    touchTargets: elemList.filter(e => e.interactive).map(e => checkTouchTarget(e.width, e.height)),
    textSizes: elemList.filter(e => e.type === 'TEXT').map(e => checkTextSize(e.fontSize)),
  };
  const accessibilityScore = calculateAccessibilityScore(accessibilityReport);
  
  // 🆕 Cognitive Load 분석
  const cognitiveMetrics = {
    elementCount: elemList.length,
    interactiveElementCount: elemList.filter(e => e.interactive).length,
    textDensity: elemList.filter(e => e.type === 'TEXT').reduce((sum, e) => sum + e.text.length, 0),
    colorVariety: new Set(elemList.map(e => e.color)).size,
    hierarchyDepth: Math.max(...elemList.map(e => e.depth)),
  };
  const cognitiveLoad = calculateCognitiveLoad(cognitiveMetrics);
  
  // 🆕 Figma 프레임에 추가
  createIssueFrame(categorized, taskFrame);
  createAccessibilityFrame(accessibilityScore, accessibilityReport, taskFrame);
  createCognitiveLoadFrame(cognitiveLoad, taskFrame);
}
```

---

## 📚 참고 자료

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Cognitive Load Theory](https://www.nngroup.com/articles/minimize-cognitive-load/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
