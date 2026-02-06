/**
 * Persona Library Module - TDD Tests
 */

import {
    Persona,
    DEFAULT_PERSONAS,
    createPersona,
    validatePersona,
} from '../features/personaLibrary';

describe('Persona Library Module', () => {
    describe('DEFAULT_PERSONAS', () => {
        it('should have at least 3 default personas', () => {
            expect(DEFAULT_PERSONAS.length).toBeGreaterThanOrEqual(3);
        });

        it('should include senior user persona', () => {
            const seniorPersona = DEFAULT_PERSONAS.find(p =>
                p.name.includes('시니어') || p.name.includes('Senior')
            );
            expect(seniorPersona).toBeDefined();
        });
    });

    describe('createPersona', () => {
        it('should create a persona with required fields', () => {
            const persona = createPersona('테스트 유저', '20대 대학생');

            expect(persona.id).toBeDefined();
            expect(persona.name).toBe('테스트 유저');
            expect(persona.description).toBe('20대 대학생');
            expect(persona.isDefault).toBe(false);
        });

        it('should generate unique IDs', () => {
            const persona1 = createPersona('유저1', '설명1');
            const persona2 = createPersona('유저2', '설명2');

            expect(persona1.id).not.toBe(persona2.id);
        });
    });

    describe('validatePersona', () => {
        it('should return true for valid persona', () => {
            const validPersona: Persona = {
                id: 'test-id',
                name: '테스트',
                description: '테스트 설명',
                isDefault: false,
            };

            expect(validatePersona(validPersona)).toBe(true);
        });

        it('should return false for empty name', () => {
            const invalidPersona: Persona = {
                id: 'test-id',
                name: '',
                description: '설명',
                isDefault: false,
            };

            expect(validatePersona(invalidPersona)).toBe(false);
        });

        it('should return false for empty description', () => {
            const invalidPersona: Persona = {
                id: 'test-id',
                name: '이름',
                description: '',
                isDefault: false,
            };

            expect(validatePersona(invalidPersona)).toBe(false);
        });
    });
});
