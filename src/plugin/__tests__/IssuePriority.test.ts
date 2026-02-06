/**
 * Issue Priority Module - TDD Tests
 * RED Phase: Write failing tests first
 */

import {
    IssuePriority,
    parseIssuePriority,
    getPriorityEmoji,
    categorizeIssuesByPriority,
    Issue,
} from '../features/issuePriority';

describe('Issue Priority Module', () => {
    describe('parseIssuePriority', () => {
        it('should parse CRITICAL priority from AI response', () => {
            const response = '🔴 Critical: 버튼이 너무 작아서 터치가 어렵습니다';
            const result = parseIssuePriority(response);
            expect(result).toBe('CRITICAL');
        });

        it('should parse MAJOR priority from AI response', () => {
            const response = '🟡 Major: 색상 대비가 부족합니다';
            const result = parseIssuePriority(response);
            expect(result).toBe('MAJOR');
        });

        it('should parse MINOR priority from AI response', () => {
            const response = '🟢 Minor: 아이콘 정렬이 약간 어긋납니다';
            const result = parseIssuePriority(response);
            expect(result).toBe('MINOR');
        });

        it('should return MINOR for unspecified priority', () => {
            const response = '일반적인 개선 제안입니다';
            const result = parseIssuePriority(response);
            expect(result).toBe('MINOR');
        });
    });

    describe('getPriorityEmoji', () => {
        it('should return 🔴 for CRITICAL', () => {
            expect(getPriorityEmoji('CRITICAL')).toBe('🔴');
        });

        it('should return 🟡 for MAJOR', () => {
            expect(getPriorityEmoji('MAJOR')).toBe('🟡');
        });

        it('should return 🟢 for MINOR', () => {
            expect(getPriorityEmoji('MINOR')).toBe('🟢');
        });
    });

    describe('categorizeIssuesByPriority', () => {
        it('should group issues by priority', () => {
            const issues: Issue[] = [
                { text: '🔴 Critical: 버튼 문제', priority: 'CRITICAL' },
                { text: '🟡 Major: 색상 문제', priority: 'MAJOR' },
                { text: '🔴 Critical: 네비게이션 문제', priority: 'CRITICAL' },
                { text: '🟢 Minor: 정렬 문제', priority: 'MINOR' },
            ];

            const categorized = categorizeIssuesByPriority(issues);

            expect(categorized.CRITICAL).toHaveLength(2);
            expect(categorized.MAJOR).toHaveLength(1);
            expect(categorized.MINOR).toHaveLength(1);
        });

        it('should return empty arrays for missing priorities', () => {
            const issues: Issue[] = [
                { text: '🟢 Minor: 작은 문제', priority: 'MINOR' },
            ];

            const categorized = categorizeIssuesByPriority(issues);

            expect(categorized.CRITICAL).toHaveLength(0);
            expect(categorized.MAJOR).toHaveLength(0);
            expect(categorized.MINOR).toHaveLength(1);
        });
    });
});
