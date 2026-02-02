import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SequenceProcessor } from '../sequenceProcessor';
import { PostData } from '../../UsabilityTester.type';

// Figma API Mocking
const mockNode = {
    id: 'mock-node-id',
    appendChild: vi.fn(),
    resize: vi.fn(),
    exportAsync: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    fills: [],
    name: 'Mock Node',
    width: 100,
    height: 100,
    visible: true,
    type: 'FRAME',
    absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
    children: []
};

const mockFigma = {
    getNodeByIdAsync: vi.fn(),
    notify: vi.fn(),
    loadFontAsync: vi.fn().mockResolvedValue(true),
    createFrame: vi.fn().mockReturnValue({ ...mockNode, layoutMode: 'NONE' }),
    createRectangle: vi.fn().mockReturnValue(mockNode),
    createText: vi.fn().mockReturnValue(mockNode),
    createImage: vi.fn().mockReturnValue({
        hash: 'mock-hash',
        getSizeAsync: vi.fn().mockResolvedValue({ width: 100, height: 100 })
    }),
    base64Encode: vi.fn().mockReturnValue('mock-base64-string'),
    viewport: {
        scrollAndZoomIntoView: vi.fn(),
    },
    clientStorage: {
        getAsync: vi.fn(),
        setAsync: vi.fn(),
    }
};

(global as any).figma = mockFigma;

describe('SequenceProcessor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should process multiple nodes and return structured results', async () => {
        // 1. Arrange
        const processor = new SequenceProcessor();
        const mockPostData: PostData = {
            taskName: 'Test Task Name',
            taskDesc: 'Test Task',
            personaDesc: 'Test Persona',
            nodeIds: ['node-1', 'node-2'],
        };
        const taskFrameId = 'task-frame-id';

        // Mock implementations
        mockFigma.getNodeByIdAsync.mockImplementation(async (id: string) => {
            if (id === 'task-frame-id') return { ...mockNode, id: 'task-frame-id', type: 'FRAME', appendChild: vi.fn() };
            return {
                ...mockNode,
                id,
                name: `Frame ${id}`,
                type: 'FRAME',
            };
        });

        // 2. Act
        const results = await processor.processSequence(mockPostData, taskFrameId);

        // 3. Assert
        expect(results).toHaveLength(2);
        expect(results[0].nodeId).toBe('node-1');
        expect(results[1].nodeId).toBe('node-2');
        expect(results[0]).toHaveProperty('labeledFrameId');
        expect(mockFigma.getNodeByIdAsync).toHaveBeenCalled();
    });
});
