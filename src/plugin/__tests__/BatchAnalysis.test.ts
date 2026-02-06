/**
 * Batch Analysis Tests
 * TDD RED Phase - Tests for sequential flow processing
 */

import {
    createBatchItems,
    calculateProgress,
    updateBatchItem,
    generateBatchSummary,
    BatchItem,
    BatchResult,
} from '../features/batchAnalysis';

describe('batchAnalysis', () => {
    describe('createBatchItems', () => {
        it('should create batch items from nodes', () => {
            const nodes = [
                { id: '1:1', name: 'Login Flow' },
                { id: '1:2', name: 'Signup Flow' },
            ];
            const items = createBatchItems(nodes);
            expect(items).toHaveLength(2);
            expect(items[0].status).toBe('pending');
            expect(items[0].name).toBe('Login Flow');
        });

        it('should return empty array for empty input', () => {
            const items = createBatchItems([]);
            expect(items).toHaveLength(0);
        });
    });

    describe('calculateProgress', () => {
        it('should calculate correct percentage', () => {
            const items: BatchItem[] = [
                { id: '1', name: 'A', nodeId: '1', status: 'completed' },
                { id: '2', name: 'B', nodeId: '2', status: 'completed' },
                { id: '3', name: 'C', nodeId: '3', status: 'pending' },
                { id: '4', name: 'D', nodeId: '4', status: 'pending' },
            ];
            const progress = calculateProgress(items, Date.now() - 10000);
            expect(progress.completed).toBe(2);
            expect(progress.total).toBe(4);
            expect(progress.percentage).toBe(50);
        });

        it('should return current item name when processing', () => {
            const items: BatchItem[] = [
                { id: '1', name: 'Done', nodeId: '1', status: 'completed' },
                { id: '2', name: 'InProgress', nodeId: '2', status: 'processing' },
                { id: '3', name: 'Waiting', nodeId: '3', status: 'pending' },
            ];
            const progress = calculateProgress(items, Date.now());
            expect(progress.current).toBe('InProgress');
        });

        it('should estimate remaining time based on elapsed', () => {
            const items: BatchItem[] = [
                { id: '1', name: 'A', nodeId: '1', status: 'completed' },
                { id: '2', name: 'B', nodeId: '2', status: 'pending' },
            ];
            const startTime = Date.now() - 5000; // 5 seconds ago
            const progress = calculateProgress(items, startTime);
            expect(progress.estimatedTimeRemaining).toBeGreaterThan(0);
        });
    });

    describe('updateBatchItem', () => {
        it('should update specific item status', () => {
            const items: BatchItem[] = [
                { id: '1', name: 'A', nodeId: '1', status: 'pending' },
                { id: '2', name: 'B', nodeId: '2', status: 'pending' },
            ];
            const updated = updateBatchItem(items, '1', { status: 'processing' });
            expect(updated[0].status).toBe('processing');
            expect(updated[1].status).toBe('pending');
        });

        it('should preserve other fields when updating', () => {
            const items: BatchItem[] = [
                { id: '1', name: 'A', nodeId: '1', status: 'pending' },
            ];
            const updated = updateBatchItem(items, '1', { status: 'completed', result: 'success' });
            expect(updated[0].name).toBe('A');
            expect(updated[0].result).toBe('success');
        });
    });

    describe('generateBatchSummary', () => {
        it('should generate summary with success count', () => {
            const result: BatchResult = {
                items: [],
                totalTime: 10000,
                successCount: 3,
                errorCount: 1,
            };
            const summary = generateBatchSummary(result);
            expect(summary).toContain('3');
            expect(summary).toContain('10');
        });

        it('should calculate success rate', () => {
            const result: BatchResult = {
                items: [
                    { id: '1', name: 'A', nodeId: '1', status: 'completed' },
                    { id: '2', name: 'B', nodeId: '2', status: 'completed' },
                ],
                totalTime: 5000,
                successCount: 2,
                errorCount: 0,
            };
            const summary = generateBatchSummary(result);
            expect(summary).toContain('100%');
        });
    });
});
