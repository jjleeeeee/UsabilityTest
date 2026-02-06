/**
 * Persona Library Module
 * Manages user personas for UX analysis
 */

export interface Persona {
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
    createdAt?: number;
}

export const DEFAULT_PERSONAS: Persona[] = [
    {
        id: 'senior-user',
        name: '시니어 사용자',
        description: '65세 이상, 디지털 기기 사용에 익숙하지 않음, 큰 글씨와 명확한 네비게이션 선호',
        isDefault: true,
    },
    {
        id: 'new-user',
        name: '신규 가입자',
        description: '서비스를 처음 사용하는 사용자, 온보딩과 가이드 필요, 주요 기능 탐색 중',
        isDefault: true,
    },
    {
        id: 'power-user',
        name: '파워 유저',
        description: '서비스를 오래 사용한 숙련자, 효율성 중시, 단축키와 고급 기능 선호',
        isDefault: true,
    },
    {
        id: 'accessibility-user',
        name: '접근성 필요 사용자',
        description: '시각 또는 운동 장애가 있는 사용자, 스크린 리더 사용, 충분한 터치 영역 필요',
        isDefault: true,
    },
    {
        id: 'busy-user',
        name: '바쁜 직장인',
        description: '시간이 촉박한 사용자, 빠른 태스크 완료 중시, 불필요한 단계에 민감',
        isDefault: true,
    },
];

/**
 * Generate unique ID for persona
 */
function generateId(): string {
    return `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new persona
 */
export function createPersona(name: string, description: string): Persona {
    return {
        id: generateId(),
        name,
        description,
        isDefault: false,
        createdAt: Date.now(),
    };
}

/**
 * Validate persona data
 */
export function validatePersona(persona: Persona): boolean {
    if (!persona.name || persona.name.trim() === '') {
        return false;
    }
    if (!persona.description || persona.description.trim() === '') {
        return false;
    }
    return true;
}

/**
 * Storage keys for Figma clientStorage
 */
const STORAGE_KEY = 'usability-tester-personas';
const MAX_CUSTOM_PERSONAS = 10;

/**
 * Save personas to Figma storage
 * Note: This function should be called from plugin context
 */
export async function savePersonas(personas: Persona[]): Promise<void> {
    const customPersonas = personas.filter(p => !p.isDefault).slice(0, MAX_CUSTOM_PERSONAS);
    await figma.clientStorage.setAsync(STORAGE_KEY, customPersonas);
}

/**
 * Load personas from Figma storage
 * Returns default + custom personas
 */
export async function loadPersonas(): Promise<Persona[]> {
    const customPersonas = await figma.clientStorage.getAsync(STORAGE_KEY) as Persona[] | undefined;
    return [...DEFAULT_PERSONAS, ...(customPersonas || [])];
}

/**
 * Delete a custom persona
 */
export async function deletePersona(personaId: string): Promise<Persona[]> {
    const allPersonas = await loadPersonas();
    const filtered = allPersonas.filter(p => p.id !== personaId || p.isDefault);
    await savePersonas(filtered.filter(p => !p.isDefault));
    return filtered;
}

/**
 * Add a new custom persona
 */
export async function addPersona(name: string, description: string): Promise<Persona[]> {
    const allPersonas = await loadPersonas();
    const customCount = allPersonas.filter(p => !p.isDefault).length;

    if (customCount >= MAX_CUSTOM_PERSONAS) {
        throw new Error(`최대 ${MAX_CUSTOM_PERSONAS}개의 커스텀 페르소나만 저장할 수 있습니다.`);
    }

    const newPersona = createPersona(name, description);
    if (!validatePersona(newPersona)) {
        throw new Error('페르소나 이름과 설명을 모두 입력해주세요.');
    }

    const updatedPersonas = [...allPersonas, newPersona];
    await savePersonas(updatedPersonas.filter(p => !p.isDefault));
    return updatedPersonas;
}
