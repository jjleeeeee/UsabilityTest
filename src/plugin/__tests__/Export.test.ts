/**
 * Export Module Tests
 * TDD RED Phase - Tests for HTML/Markdown report generation
 */

import {
    generateHtmlReport,
    generateMarkdownReport,
    exportReport,
    ReportSection,
    ExportOptions,
} from '../features/export';

describe('export', () => {
    const mockSections: ReportSection[] = [
        { title: '사용성 점수', content: '8/10', type: 'score' },
        { title: 'UX 이슈', content: '🔴 버튼이 너무 작음\n🟡 색상 대비 부족', type: 'list' },
        { title: '요약', content: '전반적으로 양호한 UX', type: 'text' },
    ];

    const defaultOptions: ExportOptions = {
        format: 'html',
        includeScreenshots: false,
        includeSummary: true,
        language: 'ko',
    };

    describe('generateHtmlReport', () => {
        it('should generate valid HTML document', () => {
            const html = generateHtmlReport('테스트 리포트', mockSections, defaultOptions);
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html lang="ko">');
            expect(html).toContain('</html>');
        });

        it('should include title in header', () => {
            const html = generateHtmlReport('테스트 리포트', mockSections, defaultOptions);
            expect(html).toContain('<h1>테스트 리포트</h1>');
            expect(html).toContain('<title>테스트 리포트</title>');
        });

        it('should render score section with special styling', () => {
            const html = generateHtmlReport('리포트', mockSections, defaultOptions);
            expect(html).toContain('class="score"');
            expect(html).toContain('8/10');
        });

        it('should render list section as ul', () => {
            const html = generateHtmlReport('리포트', mockSections, defaultOptions);
            expect(html).toContain('<ul>');
            expect(html).toContain('<li');
            expect(html).toContain('버튼이 너무 작음');
        });

        it('should apply critical class to critical issues', () => {
            const html = generateHtmlReport('리포트', mockSections, defaultOptions);
            expect(html).toContain('class="critical"');
        });

        it('should include generation date', () => {
            const html = generateHtmlReport('리포트', mockSections, { ...defaultOptions, language: 'ko' });
            expect(html).toContain('생성일');
        });
    });

    describe('generateMarkdownReport', () => {
        it('should generate valid markdown', () => {
            const md = generateMarkdownReport('테스트 리포트', mockSections, defaultOptions);
            expect(md).toContain('# 테스트 리포트');
        });

        it('should render score as bold', () => {
            const md = generateMarkdownReport('리포트', mockSections, defaultOptions);
            expect(md).toContain('**8/10**');
        });

        it('should render list items with dash', () => {
            const md = generateMarkdownReport('리포트', mockSections, defaultOptions);
            expect(md).toContain('- 🔴 버튼이 너무 작음');
        });
    });

    describe('exportReport', () => {
        it('should return HTML when format is html', () => {
            const result = exportReport('리포트', mockSections, { ...defaultOptions, format: 'html' });
            expect(result).toContain('<!DOCTYPE html>');
        });

        it('should return Markdown when format is markdown', () => {
            const result = exportReport('리포트', mockSections, { ...defaultOptions, format: 'markdown' });
            expect(result).toContain('# 리포트');
            expect(result).not.toContain('<!DOCTYPE');
        });
    });
});
