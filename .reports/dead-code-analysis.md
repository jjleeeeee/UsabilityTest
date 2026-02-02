# Dead Code Analysis Report

Generated: 2026-02-02

## ✅ Cleanup Completed

| Item | Location | Status |
|------|----------|--------|
| `resetAIConfig` | config.ts | ✅ REMOVED |
| `createPromptForReflection` | prompts.ts | ✅ REMOVED |
| `createImageFrameFromHash` | FigmaUtils.ts | ✅ REMOVED |
| `createJourneySummaryReport` | FigmaUtils.ts | ✅ REMOVED |
| `isDevelopmentMode` | FigmaUtils.ts | ✅ REMOVED |

**Result**: Code size reduced from 60.7 KiB → 58 KiB (-4.4%)

## Summary

| Category | Count | Status |
|----------|-------|--------|
| Unused Dependencies | 2 | ⚠️ CAUTION |
| Unused Dev Dependencies | 1 | ❌ KEEP |
| Unused Exports (Functions) | 16 | Mixed |
| Unused Exported Types | 1 | ✅ SAFE |

---

## 🔴 DANGER - Do NOT Remove

| Item | Location | Reason |
|------|----------|--------|
| `@figma/plugin-typings` | devDependencies | Required for Figma plugin TypeScript types |

---

## ⚠️ CAUTION - Review Before Removing

### Unused Dependencies

| Package | Reason to Keep/Remove |
|---------|----------------------|
| `@mui/lab` | Check if used in UI components |
| `figma-jsonrpc` | May be needed for RPC calls |

### Unused Exports (Used in Module)

These are exported but only used internally. Consider removing `export` keyword:

| Export | File | Action |
|--------|------|--------|
| `AIModel` | api.tsx:4 | Remove export (used internally) |
| `createText` | FigmaUtils.ts:4 | Remove export (used internally) |
| `getOrCreateUTReportsFrame` | FigmaUtils.ts:145 | Remove export (used internally) |
| `createUTReportsFrame` | FigmaUtils.ts:154 | Remove export (used internally) |
| `createTaskFrame` | FigmaUtils.ts:168 | Remove export (used internally) |
| `createNameFrame` | FigmaUtils.ts:178 | Remove export (used internally) |
| `createTaskDescFrame` | FigmaUtils.ts:197 | Remove export (used internally) |
| `createAnatomyFrame` | FigmaUtils.ts:221 | Remove export (used internally) |
| `createPreviewFrame` | FigmaUtils.ts:236 | Remove export (used internally) |
| `addNodeImageToPreviewFrame` | FigmaUtils.ts:248 | Remove export (used internally) |
| `createElemList` | FigmaUtils.ts:264 | Remove export (used internally) |
| `createImageFrameFromBytes` | FigmaUtils.ts:322 | Remove export (used internally) |
| `createLabeledImageFrame` | FigmaUtils.ts:334 | Remove export (used internally) |
| `getFrameImageBase64` | FigmaUtils.ts:378 | Remove export (used internally) |
| `prompts` | prompts.ts:1 | Remove export (used internally) |

---

## ✅ SAFE - Already Removed

### Unused Exports (Cleaned Up)

| Export | File | Status |
|--------|------|--------|
| `resetAIConfig` | config.ts | ✅ REMOVED |
| `createImageFrameFromHash` | FigmaUtils.ts | ✅ REMOVED |
| `createJourneySummaryReport` | FigmaUtils.ts | ✅ REMOVED |
| `isDevelopmentMode` | FigmaUtils.ts | ✅ REMOVED |
| `createPromptForReflection` | prompts.ts | ✅ REMOVED |
| `AIModelResponse` | UsabilityTester.type.tsx | ⏸️ KEPT (useful type) |

---

## Recommended Actions

1. **Remove unused exports**: Delete the 6 SAFE functions/types
2. **Remove export keyword**: Keep functions but remove unnecessary exports
3. **Verify dependencies**: Check if `@mui/lab` and `figma-jsonrpc` are actually needed

---

## Pre-Deletion Checklist

- [ ] Run `npm run build` - verify no errors
- [ ] Run tests if available
- [ ] Remove SAFE items one at a time
- [ ] Rebuild after each removal
