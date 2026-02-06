/**
 * Cognitive Load Analysis Module
 * Measures UI complexity and cognitive load
 */

export interface CognitiveLoadMetrics {
    elementCount: number;
    interactiveElementCount: number;
    textDensity: number;
    colorVariety: number;
    hierarchyDepth: number;
}

export interface CognitiveLoadResult {
    score: number;  // 1-10, lower is better
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    metrics: CognitiveLoadMetrics;
    recommendations: string[];
}

/**
 * Thresholds for cognitive load scoring
 */
const THRESHOLDS = {
    elements: { low: 15, high: 40 },
    interactive: { low: 5, high: 15 },
    textDensity: { low: 100, high: 300 },  // words
    colors: { low: 5, high: 12 },
    depth: { low: 3, high: 6 },
};

/**
 * Calculate cognitive load score based on UI metrics
 * @returns Score from 1-10 (1 = simple, 10 = very complex)
 */
export function calculateCognitiveLoad(metrics: CognitiveLoadMetrics): CognitiveLoadResult {
    let score = 1;
    const recommendations: string[] = [];

    // Element count scoring
    if (metrics.elementCount > THRESHOLDS.elements.high) {
        score += 2;
        recommendations.push(`요소 수(${metrics.elementCount}개)가 많습니다. ${THRESHOLDS.elements.low}개 이하로 줄이는 것이 좋습니다.`);
    } else if (metrics.elementCount > THRESHOLDS.elements.low) {
        score += 1;
    }

    // Interactive elements scoring
    if (metrics.interactiveElementCount > THRESHOLDS.interactive.high) {
        score += 2;
        recommendations.push(`상호작용 요소(${metrics.interactiveElementCount}개)가 많아 선택 장애를 유발할 수 있습니다.`);
    } else if (metrics.interactiveElementCount > THRESHOLDS.interactive.low) {
        score += 1;
    }

    // Text density scoring
    if (metrics.textDensity > THRESHOLDS.textDensity.high) {
        score += 2;
        recommendations.push('텍스트가 너무 밀집되어 있습니다. 요약하거나 단계별로 나누세요.');
    } else if (metrics.textDensity > THRESHOLDS.textDensity.low) {
        score += 1;
    }

    // Color variety scoring
    if (metrics.colorVariety > THRESHOLDS.colors.high) {
        score += 2;
        recommendations.push(`색상 종류(${metrics.colorVariety}개)가 많습니다. 브랜드 팔레트를 단순화하세요.`);
    } else if (metrics.colorVariety > THRESHOLDS.colors.low) {
        score += 1;
    }

    // Hierarchy depth scoring
    if (metrics.hierarchyDepth > THRESHOLDS.depth.high) {
        score += 2;
        recommendations.push(`정보 깊이(${metrics.hierarchyDepth}단계)가 깊습니다. 플랫한 구조를 고려하세요.`);
    } else if (metrics.hierarchyDepth > THRESHOLDS.depth.low) {
        score += 1;
    }

    // Ensure score is within bounds
    score = Math.min(10, Math.max(1, score));

    // Determine level
    let level: 'LOW' | 'MEDIUM' | 'HIGH';
    if (score <= 3) {
        level = 'LOW';
    } else if (score <= 6) {
        level = 'MEDIUM';
    } else {
        level = 'HIGH';
    }

    if (recommendations.length === 0) {
        recommendations.push('인지 부하가 적절한 수준입니다.');
    }

    return {
        score,
        level,
        metrics,
        recommendations,
    };
}

/**
 * Get cognitive load level emoji
 */
export function getCognitiveLoadEmoji(level: 'LOW' | 'MEDIUM' | 'HIGH'): string {
    switch (level) {
        case 'LOW': return '🟢';
        case 'MEDIUM': return '🟡';
        case 'HIGH': return '🔴';
    }
}

/**
 * Extract metrics from Figma node tree
 * This is a placeholder - real implementation would analyze Figma nodes
 */
export function extractMetricsFromNode(_nodeJson: unknown): CognitiveLoadMetrics {
    // Default metrics for demo
    return {
        elementCount: 0,
        interactiveElementCount: 0,
        textDensity: 0,
        colorVariety: 0,
        hierarchyDepth: 0,
    };
}
