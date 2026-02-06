/**
 * Batch Analysis Module
 * Analyzes multiple flows/sections sequentially
 */

export interface BatchItem {
    id: string;
    name: string;
    nodeId: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    result?: string;
    error?: string;
}

export interface BatchProgress {
    total: number;
    completed: number;
    current: string | null;
    percentage: number;
    estimatedTimeRemaining: number | null;
}

export interface BatchResult {
    items: BatchItem[];
    totalTime: number;
    successCount: number;
    errorCount: number;
}

/**
 * Create initial batch items from node IDs
 */
export function createBatchItems(nodes: { id: string; name: string }[]): BatchItem[] {
    return nodes.map(node => ({
        id: node.id,
        name: node.name,
        nodeId: node.id,
        status: 'pending',
    }));
}

/**
 * Calculate batch progress
 */
export function calculateProgress(items: BatchItem[], startTime: number): BatchProgress {
    const completed = items.filter(i => i.status === 'completed' || i.status === 'error').length;
    const current = items.find(i => i.status === 'processing');
    const percentage = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

    // Estimate remaining time based on average time per item
    let estimatedTimeRemaining: number | null = null;
    if (completed > 0) {
        const elapsed = Date.now() - startTime;
        const avgTimePerItem = elapsed / completed;
        const remaining = items.length - completed;
        estimatedTimeRemaining = Math.round(avgTimePerItem * remaining / 1000); // seconds
    }

    return {
        total: items.length,
        completed,
        current: current?.name || null,
        percentage,
        estimatedTimeRemaining,
    };
}

/**
 * Update batch item status
 */
export function updateBatchItem(
    items: BatchItem[],
    id: string,
    update: Partial<BatchItem>
): BatchItem[] {
    return items.map(item =>
        item.id === id ? { ...item, ...update } : item
    );
}

/**
 * Generate batch summary
 */
export function generateBatchSummary(result: BatchResult): string {
    const successRate = result.items.length > 0
        ? Math.round((result.successCount / result.items.length) * 100)
        : 0;

    return `배치 분석 완료: ${result.successCount}/${result.items.length}개 성공 (${successRate}%), 소요 시간: ${Math.round(result.totalTime / 1000)}초`;
}

/**
 * Rate limiting helper for API calls
 * Ensures minimum delay between requests
 */
export async function withRateLimit<T>(
    fn: () => Promise<T>,
    minDelayMs: number = 1000
): Promise<T> {
    const start = Date.now();
    const result = await fn();
    const elapsed = Date.now() - start;

    if (elapsed < minDelayMs) {
        await new Promise(resolve => setTimeout(resolve, minDelayMs - elapsed));
    }

    return result;
}

/**
 * Process batch items sequentially with rate limiting
 */
export async function processBatchSequentially<T>(
    items: BatchItem[],
    processor: (item: BatchItem) => Promise<T>,
    onProgress: (items: BatchItem[], progress: BatchProgress) => void,
    rateLimitMs: number = 1000
): Promise<BatchResult> {
    const startTime = Date.now();
    let currentItems = [...items];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < currentItems.length; i++) {
        const item = currentItems[i];

        // Update status to processing
        currentItems = updateBatchItem(currentItems, item.id, { status: 'processing' });
        onProgress(currentItems, calculateProgress(currentItems, startTime));

        try {
            const result = await withRateLimit(
                () => processor(item),
                rateLimitMs
            );
            currentItems = updateBatchItem(currentItems, item.id, {
                status: 'completed',
                result: String(result),
            });
            successCount++;
        } catch (error) {
            currentItems = updateBatchItem(currentItems, item.id, {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            errorCount++;
        }

        onProgress(currentItems, calculateProgress(currentItems, startTime));
    }

    return {
        items: currentItems,
        totalTime: Date.now() - startTime,
        successCount,
        errorCount,
    };
}
