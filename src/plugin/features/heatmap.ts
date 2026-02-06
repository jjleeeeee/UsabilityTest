/**
 * Heatmap Visualization Module
 * Creates visual overlay showing tap/click positions
 */

export interface TapPosition {
    x: number;
    y: number;
    intensity?: number;  // 1-10, how frequently tapped
    label?: string;
}

export interface HeatmapConfig {
    baseRadius: number;
    maxRadius: number;
    opacity: number;
    colorGradient: { r: number; g: number; b: number }[];
}

const DEFAULT_CONFIG: HeatmapConfig = {
    baseRadius: 30,
    maxRadius: 60,
    opacity: 0.4,
    colorGradient: [
        { r: 0.2, g: 0.8, b: 0.2 },   // Green (low)
        { r: 1, g: 0.8, b: 0 },        // Yellow (medium)
        { r: 1, g: 0, b: 0 },          // Red (high)
    ],
};

/**
 * Get color for intensity level
 */
export function getHeatColor(intensity: number, gradient: { r: number; g: number; b: number }[]): { r: number; g: number; b: number } {
    const normalizedIntensity = Math.max(0, Math.min(1, intensity / 10));

    if (gradient.length === 0) {
        return { r: 1, g: 0, b: 0 };
    }

    if (gradient.length === 1 || normalizedIntensity === 0) {
        return gradient[0];
    }

    if (normalizedIntensity === 1) {
        return gradient[gradient.length - 1];
    }

    const segmentSize = 1 / (gradient.length - 1);
    const segmentIndex = Math.floor(normalizedIntensity / segmentSize);
    const segmentProgress = (normalizedIntensity - segmentIndex * segmentSize) / segmentSize;

    const startColor = gradient[segmentIndex];
    const endColor = gradient[Math.min(segmentIndex + 1, gradient.length - 1)];

    return {
        r: startColor.r + (endColor.r - startColor.r) * segmentProgress,
        g: startColor.g + (endColor.g - startColor.g) * segmentProgress,
        b: startColor.b + (endColor.b - startColor.b) * segmentProgress,
    };
}

/**
 * Create a single heatmap point (ellipse node)
 * Note: This should be called from plugin context
 */
export function createHeatmapPoint(
    position: TapPosition,
    config: HeatmapConfig = DEFAULT_CONFIG
): EllipseNode {
    const intensity = position.intensity || 5;
    const radius = config.baseRadius + (intensity / 10) * (config.maxRadius - config.baseRadius);
    const color = getHeatColor(intensity, config.colorGradient);

    const point = figma.createEllipse();
    point.resize(radius * 2, radius * 2);
    point.x = position.x - radius;
    point.y = position.y - radius;
    point.fills = [{
        type: 'SOLID',
        color,
        opacity: config.opacity,
    }];
    point.name = position.label || `Tap (${intensity})`;
    point.locked = true;  // Prevent accidental modification

    return point;
}

/**
 * Create heatmap overlay frame containing all points
 */
export function createHeatmapLayer(
    positions: TapPosition[],
    parentNode: FrameNode,
    config: HeatmapConfig = DEFAULT_CONFIG
): FrameNode {
    const heatmapFrame = figma.createFrame();
    heatmapFrame.name = '🔥 Heatmap Overlay';
    heatmapFrame.resize(parentNode.width, parentNode.height);
    heatmapFrame.x = parentNode.x;
    heatmapFrame.y = parentNode.y;
    heatmapFrame.fills = [];  // Transparent
    heatmapFrame.locked = false;

    // Sort by intensity (lower first) so higher intensity points are on top
    const sortedPositions = [...positions].sort((a, b) => (a.intensity || 5) - (b.intensity || 5));

    for (const position of sortedPositions) {
        const point = createHeatmapPoint(position, config);
        heatmapFrame.appendChild(point);
    }

    return heatmapFrame;
}

/**
 * Parse tap positions from AI analysis response
 * Looks for patterns like "tap(5)" with coordinates
 */
export function parseTapPositionsFromResponse(response: string, frameWidth: number, frameHeight: number): TapPosition[] {
    const positions: TapPosition[] = [];

    // Pattern: tap(n) at approximately (x%, y%)
    const tapPattern = /tap\((\d+)\).*?(?:at|위치|좌표).*?(\d+)%.*?(\d+)%/gi;

    let match;
    while ((match = tapPattern.exec(response)) !== null) {
        const label = match[1];
        const xPercent = parseInt(match[2]) / 100;
        const yPercent = parseInt(match[3]) / 100;

        positions.push({
            x: frameWidth * xPercent,
            y: frameHeight * yPercent,
            intensity: 7,  // Default high intensity for explicit taps
            label: `Tap ${label}`,
        });
    }

    return positions;
}

/**
 * Toggle heatmap visibility by layer name
 */
export function toggleHeatmapVisibility(parent: FrameNode, visible: boolean): void {
    const heatmapLayers = parent.findChildren(node => node.name === '🔥 Heatmap Overlay');
    for (const layer of heatmapLayers) {
        layer.visible = visible;
    }
}

/**
 * Remove all heatmap layers from parent
 */
export function removeHeatmapLayers(parent: FrameNode): void {
    const heatmapLayers = parent.findChildren(node => node.name === '🔥 Heatmap Overlay');
    for (const layer of heatmapLayers) {
        layer.remove();
    }
}
