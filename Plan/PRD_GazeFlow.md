# Gaze Flow Visualization PRD

> **Product Requirements Document**  
> Version: 1.2 (최종)  
> Date: 2026-02-06  
> Feature: AI 기반 시선 흐름 시각화  
> Branch: `feat/gaze-flow-visualization`

---

## 📋 Executive Summary

**문제**: 디자이너가 사용자의 시선이 어디로 이동하는지, 왜 특정 요소를 클릭했는지 이해하기 어렵습니다.

**솔루션**: AI의 **관찰(Observation)** 섹션에 시선 흐름을 포함시키고, `labeled_action` 프레임에 화살표로 시각화하여 **"시선 → 사고 → 행동"**의 완벽한 스토리텔링을 제공합니다.

**핵심 가치**: 
- ✅ 기존 UI 요소 번호 재활용 (새 번호 불필요)
- ✅ 관찰 텍스트와 시각화 자동 동기화
- ✅ 완벽한 사용자 여정 스토리텔링
- ✅ 빠른 구현 (1.5일)

---

## 🎯 Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| 스토리텔링 완성도 | "시선→행동 연결 이해됨" 평가 | 90% |
| 구현 속도 | 개발 완료 시간 | 1.5일 이내 |
| AI 예측 정확도 | 디자이너 검증 일치율 | 70% 이상 |

---

## 🔍 User Stories

### Primary User: UX 디자이너

> "사용자가 **왜 그 버튼을 눌렀는지** 알고 싶어요. 어떤 시선 흐름으로 그 버튼에 도달했는지 보고 싶습니다."

**As a** UX 디자이너  
**I want to** 관찰 텍스트에서 시선 흐름을 읽고, 시각화로 확인하고 싶다  
**So that** 사용자의 인지 과정을 완전히 이해할 수 있다

### Acceptance Criteria
- [ ] AI의 관찰 섹션에 UI 요소 번호로 시선 흐름 설명
- [ ] `labeled_action` 프레임에 시선 화살표 시각화
- [ ] 화살표 끝이 터치 포인트로 연결
- [ ] 텍스트와 시각화 자동 동기화

---

## 🎨 Visual Design

### 기존 구조 (변경 없음)

```
1_after_labeled (참고용)
├── 이미지
├── [1] 로고
├── [2] 헤더
├── [3] 검색 바
├── [4] 메인 이미지
└── [5] CTA 버튼
```

### Gaze Flow 통합 후

```
1_labeled_action (스토리텔링)
├── 이미지
├── gazeArrow [1]→[4] (시선 흐름 1단계)
├── gazeArrow [4]→[5] (시선 흐름 2단계)
├── boundingBox [5] (터치 영역)
└── touchPoint [5] (최종 액션!)
```

### 시각적 예시

```
┌──────────────────────────────────────────────┐
│  [1] 로고 ──────────▶ [4] 메인 이미지        │
│                           │                  │
│                           │ (굵은 화살표)     │
│                           ▼                  │
│                      [5] CTA 버튼 ●          │
│                          (터치!)             │
└──────────────────────────────────────────────┘
```

### 시각적 요소

| 요소 | 스타일 | 의미 |
|------|--------|------|
| **UI 요소 번호** | `after_labeled`의 기존 번호 재활용 | 참조 번호 |
| **화살표** | 곡선 Bézier (Figma Vector) | 시선 이동 경로 |
| **굵기** | 2px (기본) ~ 4px (강조) | 주목도 |
| **색상** | `#6366F1` (Primary Blue) | 시선 흐름 |
| **불투명도** | 0.7 | 기존 요소 방해 최소화 |
| **터치 포인트** | 빨간색 원 (기존) | 최종 액션 |

---

## 🏗️ Technical Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Action: "분석 시작" 버튼 클릭                         │
├─────────────────────────────────────────────────────────────┤
│ 2. Figma Plugin → AI Prompt 생성 (관찰 섹션 수정)             │
│    "관찰: 사용자가 이 화면을 처음 봤을 때 시선이 이동하는      │
│     순서를 UI 요소 번호([1], [2], ...)로 설명하세요."         │
├─────────────────────────────────────────────────────────────┤
│ 3. Gemini API → 응답 예시:                                   │
│    "관찰: [1] 로고를 먼저 보고, [4] 메인 이미지로 시선이       │
│     이동한 후, [5] CTA 버튼에 주목합니다."                     │
│    "행동: tap(5)"                                            │
├─────────────────────────────────────────────────────────────┤
│ 4. Parser → 관찰 텍스트에서 [1], [4], [5] 추출               │
│    gazeFlow = [1, 4, 5]                                     │
├─────────────────────────────────────────────────────────────┤
│ 5. Coordinate Mapper → elemList에서 좌표 가져오기             │
│    coordinates = [                                          │
│      { x: elem[0].center.x, y: elem[0].center.y },         │
│      { x: elem[3].center.x, y: elem[3].center.y },         │
│      { x: elem[4].center.x, y: elem[4].center.y }          │
│    ]                                                        │
├─────────────────────────────────────────────────────────────┤
│ 6. Renderer → labeled_action 프레임에 화살표 추가             │
│    [1]→[4]→[5] 화살표 + [5] 터치 포인트                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Implementation Plan

### Phase 1: Core Logic (0.5일)

#### 1.1 새 모듈 생성
**파일**: `src/plugin/features/gazeFlow.ts`

```typescript
export interface GazeFlowConfig {
  arrowColor: { r: number; g: number; b: number };
  minThickness: number;
  maxThickness: number;
  opacity: number;
}

// 관찰 텍스트에서 UI 요소 번호 추출
export function parseGazeFlowFromObservation(observation: string): number[];

// elemList에서 좌표 가져오기
export function getCoordinatesFromElements(
  elementNumbers: number[],
  elemList: UIElement[],
  elementStartX: number,
  elementStartY: number
): { x: number; y: number }[];

// 화살표 생성
export function createGazeFlowArrow(
  from: { x: number; y: number },
  to: { x: number; y: number },
  config: GazeFlowConfig
): VectorNode;
```

#### 1.2 프롬프트 수정
**파일**: `src/plugin/utils/prompts.ts`

```typescript
// 기존 관찰 섹션 수정
export const OBSERVATION_SECTION = `
관찰 (Observation):
사용자가 이 화면을 처음 봤을 때 시선이 이동하는 순서를 UI 요소 번호로 설명하세요.
UI 요소 번호는 대괄호로 표시합니다 (예: [1], [2], [3]).

예시:
"[1] 상단 로고를 먼저 보고, [4] 메인 이미지로 시선이 이동한 후, 
 [5] CTA 버튼에 주목합니다."
`;
```

---

### Phase 2: Figma Rendering (0.5일)

#### 2.1 화살표 생성 함수
**파일**: `src/plugin/features/gazeFlow.ts`

```typescript
export function createGazeFlowArrow(
  from: { x: number; y: number },
  to: { x: number; y: number },
  config: GazeFlowConfig
): VectorNode {
  const arrow = figma.createVector();
  arrow.name = `gazeArrow_${from.x}_${to.x}`;
  
  // Bézier curve 경로 계산
  const controlPoint = {
    x: (from.x + to.x) / 2,
    y: Math.min(from.y, to.y) - 30  // 위로 살짝 휘어지게
  };
  
  // 화살표 경로 설정
  arrow.vectorPaths = [{
    windingRule: 'NONZERO',
    data: `M ${from.x} ${from.y} Q ${controlPoint.x} ${controlPoint.y} ${to.x} ${to.y}`
  }];
  
  // 스타일 적용
  arrow.strokes = [{ type: 'SOLID', color: config.arrowColor }];
  arrow.strokeWeight = config.minThickness;
  arrow.opacity = config.opacity;
  
  return arrow;
}
```

#### 2.2 좌표 매핑 함수
```typescript
export function getCoordinatesFromElements(
  elementNumbers: number[],
  elemList: UIElement[],
  elementStartX: number,
  elementStartY: number
): { x: number; y: number }[] {
  return elementNumbers.map(num => {
    const elem = elemList[num - 1];
    if (!elem) return null;
    
    return {
      x: elem.bbox.x + elem.bbox.width / 2 + elementStartX,
      y: elem.bbox.y + elem.bbox.height / 2 + elementStartY
    };
  }).filter(Boolean);
}
```

---

### Phase 3: Integration (0.5일)

#### 3.1 Controller 연동
**파일**: `src/plugin/controller.ts`

**수정 위치**: `labeled_action` 프레임 생성 직후 (L217-L260 사이)

```typescript
// 기존 코드 (L217)
actionImageFrame.name = `${i + 1}_labeled_action`;
actionImageFrame.resize(labeledFrame.width, labeledFrame.height);

// ... (기존 beforeImage, boundingBox, touchPoint 생성)

// 🆕 Gaze Flow 추가
import { 
  parseGazeFlowFromObservation, 
  getCoordinatesFromElements,
  createGazeFlowArrow 
} from './features/gazeFlow';

// 관찰 텍스트에서 UI 요소 번호 추출
const observation = stepObservations[i] || '';  // 각 Step의 관찰 텍스트
const gazeFlow = parseGazeFlowFromObservation(observation);

if (gazeFlow.length > 0) {
  const config = {
    arrowColor: { r: 0.39, g: 0.4, b: 0.95 }, // #6366F1
    minThickness: 2,
    maxThickness: 4,
    opacity: 0.7
  };
  
  // elemList에서 좌표 가져오기
  const coordinates = getCoordinatesFromElements(
    gazeFlow,
    elemList,
    elementStartX,
    elementStartY
  );
  
  // 화살표 추가 ([1]→[4], [4]→[5], ...)
  for (let j = 0; j < coordinates.length - 1; j++) {
    const arrow = createGazeFlowArrow(
      coordinates[j],
      coordinates[j + 1],
      config
    );
    actionImageFrame.appendChild(arrow);
  }
}
```

---

## 🧪 Test Strategy

### Unit Tests
**파일**: `src/plugin/__tests__/GazeFlow.test.ts`

```typescript
describe('GazeFlow', () => {
  test('관찰 텍스트에서 UI 요소 번호 파싱', () => {
    const observation = "[1] 로고를 보고, [4] 이미지로 이동한 후, [5] 버튼에 주목합니다.";
    const gazeFlow = parseGazeFlowFromObservation(observation);
    expect(gazeFlow).toEqual([1, 4, 5]);
  });

  test('elemList에서 좌표 추출', () => {
    const elemList = [
      { bbox: { x: 10, y: 20, width: 100, height: 50 } },
      { bbox: { x: 50, y: 100, width: 200, height: 100 } }
    ];
    const coords = getCoordinatesFromElements([1, 2], elemList, 0, 0);
    expect(coords[0]).toEqual({ x: 60, y: 45 });  // center of elem[0]
    expect(coords[1]).toEqual({ x: 150, y: 150 }); // center of elem[1]
  });
});
```

### Manual Testing
- [ ] 다양한 관찰 텍스트 패턴 테스트
- [ ] 화살표가 터치 포인트로 자연스럽게 연결되는지 확인
- [ ] 텍스트와 시각화 일치 여부 검증

---

## 📖 스토리텔링 예시

### Step 2: 상품 상세 보기

**관찰 (Observation)**:
> "[1] 상단 로고를 확인한 후, [4] 메인 상품 이미지로 시선이 이동합니다. 이미지 하단의 [5] '상세 보기' 버튼이 눈에 띕니다."

**사고 (Thought)**:
> "상품이 마음에 들어 더 자세히 보고 싶습니다."

**행동 (Action)**:
> `tap(5)`

**시각화 (labeled_action)**:
```
[1] 로고 ──────▶ [4] 이미지 ──────▶ [5] 버튼 ●
                                    (터치!)
```

**결과**: 
- ✅ 왜 [5]를 눌렀는지 명확
- ✅ 텍스트와 시각화 완벽 일치
- ✅ 사용자의 인지 과정 완전 재현

---

## 🚫 Out of Scope (이번 버전에서 제외)

| 기능 | 제외 사유 |
|------|----------|
| 독립 번호 배지 | 기존 `after_labeled` 번호 재활용 |
| UI 토글 버튼 | 관찰 섹션에 자동 포함 |
| 독립 Gaze Flow 레이어 | `labeled_action` 통합으로 대체 |
| 실제 Eye-tracking 연동 | 하드웨어 필요, Figma 환경 제약 |
| 히트맵 오버레이 | Phase 2로 연기 |

---

## 📊 Success Criteria

### MVP 완료 조건
- [ ] AI 관찰 섹션에 UI 요소 번호로 시선 흐름 설명
- [ ] `labeled_action` 프레임에 화살표 시각화
- [ ] 화살표가 터치 포인트로 연결
- [ ] Unit test 커버리지 80% 이상

### 사용자 검증
- [ ] 3명의 디자이너에게 데모
- [ ] "시선→행동 연결 이해됨" 90% 이상
- [ ] "스토리텔링이 완성됨" 85% 이상

---

## 🗓️ Timeline

| 단계 | 소요 시간 | 담당 |
|------|----------|------|
| PRD 작성 | 0.5일 | ✅ 완료 |
| Core Logic 구현 | 0.5일 | 예정 |
| Figma Rendering | 0.5일 | 예정 |
| Integration & Test | 0.5일 | 예정 |
| **Total** | **2일** | |

---

## 🔄 Future Enhancements (Phase 2)

1. **시선 머무름 시간**: 화살표 굵기로 표현
2. **A/B 비교**: 두 디자인의 시선 흐름 비교
3. **애니메이션**: 시선 이동 경로를 순차 애니메이션으로 표시
4. **히트맵 모드**: Gaze Flow 검증 후 히트맵 추가

---

## 📝 Appendix

### 참고 자료
- [F-Pattern Reading](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- [Z-Pattern Layout](https://www.nngroup.com/articles/z-shaped-pattern-reading-web-content/)
- [Visual Hierarchy Principles](https://www.interaction-design.org/literature/article/visual-hierarchy-organizing-content-to-follow-natural-eye-movement-patterns)

### 기술 스택
- Figma Plugin API (Vector, Frame, Text Nodes)
- Gemini 3.0 Flash/Pro
- TypeScript 5.x
- Vitest (Testing)

### 통합 이점

| 항목 | 독립 레이어 | 기존 번호 활용 (최종안) |
|------|------------|------------------------|
| 번호 체계 | 새로운 번호 필요 | ✅ 기존 번호 재활용 |
| 텍스트-시각화 동기화 | 수동 | ✅ 자동 |
| 스토리텔링 완성도 | 보통 | ✅ 완벽 (시선→사고→행동) |
| 구현 복잡도 | 중간 | ✅ 낮음 |
| 사용자 경험 | 토글 필요 | ✅ 자동 포함 |
