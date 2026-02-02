import { describe, it, expect } from 'vitest';

function parseHolisticActions(rsp: string, count: number): string[] {
    const actions: string[] = [];
    for (let i = 1; i <= count; i++) {
        const regex = new RegExp(`- Step ${i} Action: (.*?)(?:\\n|$)`, 'i');
        const match = rsp.match(regex);
        actions.push(match ? match[1].trim() : 'FINISH');
    }
    return actions;
}

describe('Holistic Response Parsing', () => {
    it('should extract step-by-step actions from the refined response format', () => {
        const mockRsp = `
관찰 (Observation): 여러 화면이 보입니다.
사고 (Thought): 흐름이 자연스럽습니다.

여정 분석 (Journey Actions):
- Step 1 Action: tap(3)
- Step 2 Action: text("검색어")
- Step 3 Action: FINISH

요약 (Summary): 좋습니다.`;

        const actions = parseHolisticActions(mockRsp, 3);
        expect(actions).toEqual(['tap(3)', 'text("검색어")', 'FINISH']);
    });

    it('should correctly parse Observation section with bold markdown and Korean text', () => {
        const mockRsp = `
관찰 (Observation):**
- **Step 1:** 쿠폰함 페이지입니다.
- **Step 2:** 상세 페이지로 이동합니다.

사고 (Thought): 흐름이 자연스럽습니다.

여정 분석 (Journey Actions):
- Step 1 Action: tap(3)
`;
        const sections = [
            { label: '여정 관찰 (Journey Observation)', pattern: /(?:Observation|관찰)[:：]?\s*([\s\S]*?)(?=\n(?:Thought|사고|Action|행동|Summary|요약)|$)/i },
        ];

        const match = mockRsp.match(sections[0].pattern);
        expect(match).toBeTruthy();
        expect(match![1].trim()).toContain('- **Step 1:** 쿠폰함 페이지입니다.');
        expect(match![1].trim()).toContain('- **Step 2:** 상세 페이지로 이동합니다.');
    });

    it('should fail or handle Action on new line (Reproduce Issue)', () => {
        const mockRsp = `
 여정 분석 (Journey Actions):
 - Step 1 Action: 
 tap(3)
 - Step 2 Action: swipe(1, "up", "medium")
 `;
        // Improved Regex: Use [\s\S] to match newlines, and lookahead for next Step or End
        // 1. Extract Section (Mocking controller logic)
        const actionsSectionMatch = mockRsp.match(/(?:Journey Actions|여정 분석)[:：]?\s*([\s\S]*?)(?=(?:Summary|요약)|$)/i);
        const actionsSection = actionsSectionMatch ? actionsSectionMatch[1] : '';

        expect(actionsSection).toContain('tap(3)');

        // 2. Parse Step (Mocking controller logic)
        const i = 1;
        const regex = new RegExp(`(?:-?\\s*Step\\s*${i}|-?\\s*${i}\\s*단계).*?(?:Action|행동|동작)[:：]?\\s*([\\s\\S]*?)(?=(?:-?\\s*Step\\s*\\d+|-?\\s*\\d+\\s*단계)|$)`, 'i');

        const match = actionsSection.match(regex);
        const captured = match ? match[1].trim() : 'null';

        console.log('Captured:', captured);
        expect(captured).toBe('tap(3)');
    });
});

