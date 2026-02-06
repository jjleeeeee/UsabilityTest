/**
 * Prompt Customization Tests
 * TDD RED Phase - Tests for focus area prompt building
 */

import {
    FOCUS_OPTIONS,
    buildFocusPromptSection,
    getDefaultFocusAreas,
    AnalysisFocus,
} from '../features/promptCustomization';

describe('promptCustomization', () => {
    describe('FOCUS_OPTIONS', () => {
        it('should have 5 focus options', () => {
            expect(FOCUS_OPTIONS).toHaveLength(5);
        });

        it('should have required fields for each option', () => {
            FOCUS_OPTIONS.forEach((option) => {
                expect(option.id).toBeDefined();
                expect(option.label).toBeDefined();
                expect(option.description).toBeDefined();
                expect(option.promptAddition).toBeDefined();
            });
        });

        it('should include accessibility focus option', () => {
            const accessibilityOption = FOCUS_OPTIONS.find(o => o.id === 'accessibility');
            expect(accessibilityOption).toBeDefined();
            expect(accessibilityOption?.promptAddition).toContain('색상 대비');
        });
    });

    describe('buildFocusPromptSection', () => {
        it('should return empty string for empty focus areas', () => {
            const result = buildFocusPromptSection([]);
            expect(result).toBe('');
        });

        it('should build prompt section for single focus area', () => {
            const result = buildFocusPromptSection(['accessibility']);
            expect(result).toContain('추가 분석 관점');
            expect(result).toContain('색상 대비');
            expect(result).toContain('터치 타겟');
        });

        it('should build prompt section for multiple focus areas', () => {
            const result = buildFocusPromptSection(['accessibility', 'structure']);
            expect(result).toContain('색상 대비');
            expect(result).toContain('정보 계층');
            expect(result).toContain('네비게이션');
        });

        it('should ignore invalid focus area ids', () => {
            const result = buildFocusPromptSection(['invalid' as AnalysisFocus]);
            expect(result).toBe('');
        });
    });

    describe('getDefaultFocusAreas', () => {
        it('should return accessibility and structure as defaults', () => {
            const defaults = getDefaultFocusAreas();
            expect(defaults).toContain('accessibility');
            expect(defaults).toContain('structure');
            expect(defaults).toHaveLength(2);
        });
    });
});
