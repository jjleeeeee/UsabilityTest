# 데드 코드 분석 종합 보고서

> **생성일**: 2026-02-06  
> **분석 도구**: knip, depcheck, ts-prune  
> **프로젝트**: UsabilityTester

---

## 📊 Executive Summary

| 카테고리 | 발견 항목 | 실제 제거 | 상태 |
|---------|----------|----------|------|
| 미사용 파일 | 4개 | 0개 | 🟡 False Positive |
| 미사용 Dependencies | 2개 | 2개 | ✅ 제거 완료 |
| 미사용 DevDependencies | 10개 | 0개 | � False Positive |
| 미사용 Export (features/index.ts) | 86개 | 0개 | � 향후 사용 예정 |
| 미사용 Export (기타) | 13개 | 0개 | 🟡 False Positive |

---

## ✅ 제거 완료

### 미사용 Dependencies (2개)

```json
{
  "@mui/lab": "사용되지 않음 ✅ 제거됨",
  "figma-jsonrpc": "사용되지 않음 ✅ 제거됨"
}
```

**실행 완료**:
```bash
npm uninstall @mui/lab figma-jsonrpc --legacy-peer-deps
```

---

## 🔴 False Positive: depcheck 오탐지

### DevDependencies (10개 중 8개가 실제 사용 중)

```json
{
  "@figma/plugin-typings": "🔴 실제 사용 중 (Figma 타입 정의)",
  "css-loader": "🔴 실제 사용 중 (webpack.config.js)",
  "depcheck": "✅ 제거됨 (일회성 분석 도구)",
  "knip": "✅ 제거됨 (일회성 분석 도구)",
  "style-loader": "🔴 실제 사용 중 (webpack.config.js)",
  "ts-loader": "🔴 실제 사용 중 (webpack.config.js)",
  "ts-prune": "✅ 제거됨 (일회성 분석 도구)",
  "typescript": "🔴 실제 사용 중 (전체 프로젝트)",
  "url-loader": "🔴 실제 사용 중 (webpack.config.js)",
  "webpack-cli": "🔴 실제 사용 중 (빌드 필수)"
}
```

**실행 결과**:
```bash
# 분석 도구만 제거 성공
npm uninstall depcheck knip ts-prune --legacy-peer-deps
```

⚠️ **중요**: depcheck는 webpack.config.js에서 사용되는 패키지를 감지하지 못했습니다. 대부분이 false positive였습니다.

---

### 3. 미사용 Export (features/index.ts)

**파일**: `src/plugin/features/index.ts`

이 파일은 **re-export 허브**로, 다른 feature 모듈의 함수들을 모아서 export합니다. 
현재 86개의 export가 미사용으로 표시되었지만, 이는 **향후 사용 예정**이거나 **API 인터페이스**로 유지할 수 있습니다.

**발견된 미사용 Export 카테고리**:
- Issue Priority (7개)
- Persona Library (11개)
- Prompt Customization (9개)
- Accessibility (9개)
- Cognitive Load (7개)
- Batch Analysis (9개)
- Multi-Model (11개)
- Export (5개)
- Slack (9개)
- Heatmap (9개)

**권장 조치**:
```typescript
// Option 1: 전체 유지 (향후 사용 예정)
// 현재 상태 유지

// Option 2: 실제 사용하는 것만 export
// features/index.ts에서 미사용 export 제거
```

---

## 🟡 CAUTION: 주의 필요

### 1. 미사용 파일 (4개)

```
src/plugin/features/heatmap.ts
src/plugin/features/index.ts
src/plugin/features/multiModel.ts
src/plugin/features/slack.ts
```

**분석**:
- `heatmap.ts`: Phase 2 기능 (향후 구현 예정)
- `index.ts`: Re-export 허브 (유지 권장)
- `multiModel.ts`: 모델 선택 기능 (실제 사용 중, false positive)
- `slack.ts`: Phase 2 기능 (향후 구현 예정)

**권장 조치**:
- ✅ `index.ts`, `multiModel.ts`: **유지** (실제 사용 중)
- 🔄 `heatmap.ts`, `slack.ts`: **유지** (향후 사용 예정) 또는 **Phase 2로 이동**

---

### 2. 미사용 Export (기타 파일)

#### `FigmaUtils.ts` (13개)

```typescript
// 미사용 export
createText
getOrCreateUTReportsFrame
createUTReportsFrame
createTaskFrame
createNameFrame
createTaskDescFrame
createAnatomyFrame
createPreviewFrame
addNodeImageToPreviewFrame
createElemList
createImageFrameFromBytes
createLabeledImageFrame
getFrameImageBase64
```

**분석**: 이 함수들은 `controller.ts`에서 사용되고 있으나, knip가 감지하지 못했습니다 (false positive).

**권장 조치**: **유지** (실제 사용 중)

---

#### `api.tsx` (1개)

```typescript
export class AIModel { ... }
```

**분석**: `controller.ts`에서 `createModelInstance()`를 통해 간접적으로 사용됩니다.

**권장 조치**: **유지** (실제 사용 중)

---

#### `prompts.ts` (2개)

```typescript
export const prompts = { ... }
export function createPromptForTask(...) { ... }
```

**분석**: `controller.ts`에서 사용 중입니다.

**권장 조치**: **유지** (실제 사용 중)

---

## 🔴 DANGER: 제거 금지

### 설정 파일

```
vitest.config.ts (default export)
```

**분석**: Vitest 설정 파일로, 테스트 실행에 필수입니다.

**권장 조치**: **절대 제거 금지**

---

## 📋 최종 결과 요약

### ✅ 제거 완료 (5개 패키지)

```bash
# 1. 미사용 dependencies 제거 ✅
npm uninstall @mui/lab figma-jsonrpc --legacy-peer-deps

# 2. 분석 도구 제거 (일회성) ✅
npm uninstall depcheck knip ts-prune --legacy-peer-deps
```

### 🔴 제거 실패 (False Positive)

```bash
# webpack.config.js에서 실제 사용 중
# @figma/plugin-typings, css-loader, style-loader, ts-loader, url-loader, webpack-cli
# typescript (전체 프로젝트에서 사용)
```

### 검토 필요 (CAUTION)

1. **features/index.ts**: 미사용 export 86개
   - Option A: 전체 유지 (향후 사용 예정)
   - Option B: 실제 사용하는 것만 export

2. **Phase 2 기능 파일**:
   - `heatmap.ts`, `slack.ts`
   - Option A: 현재 위치 유지
   - Option B: `Plan/` 디렉토리로 이동

---

## 🧪 테스트 전략

### 삭제 전 체크리스트

- [ ] 전체 테스트 실행: `npm test`
- [ ] 빌드 성공 확인: `npm run build`
- [ ] 변경 사항 적용
- [ ] 테스트 재실행
- [ ] 실패 시 롤백

---

## 📊 False Positive 분석

다음 항목들은 **실제로 사용 중**이지만 도구가 감지하지 못했습니다:

| 항목 | 파일 | 실제 사용 위치 |
|------|------|---------------|
| `multiModel.ts` | features/ | `controller.ts`, `App.tsx` |
| `FigmaUtils.ts` exports | utils/ | `controller.ts` |
| `AIModel` | api.tsx | `controller.ts` (간접) |
| `prompts` | utils/ | `controller.ts` |
| `typescript` | devDependencies | 전체 프로젝트 |

---

## 🔄 완료된 작업

1. ✅ **분석 도구 실행** (knip, depcheck, ts-prune)
2. ✅ **미사용 dependencies 제거** (@mui/lab, figma-jsonrpc)
3. ✅ **분석 도구 제거** (depcheck, knip, ts-prune)
4. ✅ **테스트 검증** (77개 테스트 통과)
5. ✅ **빌드 검증** (code.js: 29.6KB)
6. ✅ **결과 문서화** (.reports/dead-code-analysis.md)

## 📊 최종 통계

| 항목 | 제거 전 | 제거 후 | 변화 |
|------|---------|---------|------|
| Dependencies | 14개 | 12개 | -2개 |
| DevDependencies | 30개 | 27개 | -3개 |
| 총 패키지 | 651개 | 573개 | -78개 |
| code.js 크기 | 29.5KB | 29.6KB | +0.1KB |

---

## 📚 참고 자료

- [knip 문서](https://github.com/webpro/knip)
- [depcheck 문서](https://github.com/depcheck/depcheck)
- [ts-prune 문서](https://github.com/nadeesha/ts-prune)
