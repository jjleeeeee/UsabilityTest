/**
 * Prompt Customization Module
 * Allows users to customize analysis focus areas
 */

export type AnalysisFocus =
    | 'accessibility'    // 접근성
    | 'structure'        // 정보 구조
    | 'visual'           // 시각 디자인
    | 'interaction'      // 마이크로인터랙션
    | 'error';           // 에러 처리

export interface FocusOption {
    id: AnalysisFocus;
    label: string;
    description: string;
    promptAddition: string;
}

export const FOCUS_OPTIONS: FocusOption[] = [
    {
        id: 'accessibility',
        label: '접근성',
        description: 'WCAG 기준 접근성 검사',
        promptAddition: `
접근성 분석:
- 색상 대비가 4.5:1 이상인지 확인
- 터치 타겟 크기가 44x44px 이상인지 확인
- 텍스트 크기가 충분히 큰지 확인
- 스크린 리더 사용자를 위한 대체 텍스트 존재 여부`,
    },
    {
        id: 'structure',
        label: '정보 구조',
        description: '정보 계층과 네비게이션 분석',
        promptAddition: `
정보 구조 분석:
- 정보 계층이 명확한지 확인
- 네비게이션 패턴이 일관적인지 확인
- 사용자가 현재 위치를 알 수 있는지 확인
- 주요 기능에 3클릭 이내로 도달 가능한지 확인`,
    },
    {
        id: 'visual',
        label: '시각 디자인',
        description: '시각적 일관성과 미적 요소 분석',
        promptAddition: `
시각 디자인 분석:
- 색상 사용이 일관적인지 확인
- 타이포그래피 계층이 명확한지 확인
- 여백과 정렬이 적절한지 확인
- 시각적 노이즈가 없는지 확인`,
    },
    {
        id: 'interaction',
        label: '마이크로인터랙션',
        description: '피드백과 전환 애니메이션 분석',
        promptAddition: `
마이크로인터랙션 분석:
- 버튼 클릭/탭 피드백이 즉각적인지 확인
- 로딩 상태가 명확히 표시되는지 확인
- 전환 애니메이션이 자연스러운지 확인
- 사용자 입력에 대한 실시간 피드백 존재 여부`,
    },
    {
        id: 'error',
        label: '에러 처리',
        description: '에러 메시지와 복구 전략 분석',
        promptAddition: `
에러 처리 분석:
- 에러 메시지가 사용자 친화적인지 확인
- 에러 발생 시 해결 방법이 제시되는지 확인
- 빈 상태(Empty State)가 적절히 처리되는지 확인
- 실수 방지를 위한 확인 단계가 있는지 확인`,
    },
];

export interface PromptSettings {
    focusAreas: AnalysisFocus[];
    customInstructions?: string;
}

const SETTINGS_KEY = 'usability-tester-prompt-settings';

/**
 * Build custom prompt section based on selected focus areas
 */
export function buildFocusPromptSection(focusAreas: AnalysisFocus[]): string {
    if (focusAreas.length === 0) {
        return '';
    }

    const sections = focusAreas
        .map(focusId => FOCUS_OPTIONS.find(opt => opt.id === focusId))
        .filter(Boolean)
        .map(opt => opt!.promptAddition);

    if (sections.length === 0) {
        return '';
    }

    return `
추가 분석 관점:
${sections.join('\n')}`;
}

/**
 * Save prompt settings to Figma storage
 */
export async function savePromptSettings(settings: PromptSettings): Promise<void> {
    await figma.clientStorage.setAsync(SETTINGS_KEY, settings);
}

/**
 * Load prompt settings from Figma storage
 */
export async function loadPromptSettings(): Promise<PromptSettings> {
    const settings = await figma.clientStorage.getAsync(SETTINGS_KEY) as PromptSettings | undefined;
    return settings || { focusAreas: [] };
}

/**
 * Get default focus areas
 */
export function getDefaultFocusAreas(): AnalysisFocus[] {
    return ['accessibility', 'structure'];
}
