/**
 * Cognitive Load Tests
 * TDD RED Phase - Tests for UI complexity scoring
 */

import {
    calculateCognitiveLoad,
    getCognitiveLoadEmoji,
    CognitiveLoadMetrics,
} from '../features/cognitiveLoad';

describe('cognitiveLoad', () => {
    describe('calculateCognitiveLoad', () => {
        it('should return LOW level for minimal UI', () => {
            const metrics: CognitiveLoadMetrics = {
                elementCount: 5,
                interactiveElementCount: 2,
                textDensity: 50,
                colorVariety: 3,
                hierarchyDepth: 2,
            };
            const result = calculateCognitiveLoad(metrics);
            expect(result.level).toBe('LOW');
            expect(result.score).toBeLessThanOrEqual(3);
        });

        it('should return MEDIUM level for moderate UI', () => {
            const metrics: CognitiveLoadMetrics = {
                elementCount: 25,
                interactiveElementCount: 8,
                textDensity: 150,
                colorVariety: 8,
                hierarchyDepth: 4,
            };
            const result = calculateCognitiveLoad(metrics);
            expect(result.level).toBe('MEDIUM');
            expect(result.score).toBeGreaterThan(3);
            expect(result.score).toBeLessThanOrEqual(6);
        });

        it('should return HIGH level for complex UI', () => {
            const metrics: CognitiveLoadMetrics = {
                elementCount: 50,
                interactiveElementCount: 20,
                textDensity: 400,
                colorVariety: 15,
                hierarchyDepth: 8,
            };
            const result = calculateCognitiveLoad(metrics);
            expect(result.level).toBe('HIGH');
            expect(result.score).toBeGreaterThan(6);
        });

        it('should include recommendations for high element count', () => {
            const metrics: CognitiveLoadMetrics = {
                elementCount: 50,
                interactiveElementCount: 2,
                textDensity: 50,
                colorVariety: 3,
                hierarchyDepth: 2,
            };
            const result = calculateCognitiveLoad(metrics);
            expect(result.recommendations.some(r => r.includes('요소 수'))).toBe(true);
        });

        it('should include recommendations for text density', () => {
            const metrics: CognitiveLoadMetrics = {
                elementCount: 5,
                interactiveElementCount: 2,
                textDensity: 400,
                colorVariety: 3,
                hierarchyDepth: 2,
            };
            const result = calculateCognitiveLoad(metrics);
            expect(result.recommendations.some(r => r.includes('텍스트'))).toBe(true);
        });
    });

    describe('getCognitiveLoadEmoji', () => {
        it('should return green for LOW', () => {
            expect(getCognitiveLoadEmoji('LOW')).toBe('🟢');
        });

        it('should return yellow for MEDIUM', () => {
            expect(getCognitiveLoadEmoji('MEDIUM')).toBe('🟡');
        });

        it('should return red for HIGH', () => {
            expect(getCognitiveLoadEmoji('HIGH')).toBe('🔴');
        });
    });
});
