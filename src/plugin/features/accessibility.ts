/**
 * Accessibility Analysis Module
 * Provides WCAG-based accessibility checking
 */

export interface ColorContrastResult {
    ratio: number;
    passes: {
        AA: boolean;
        AAA: boolean;
    };
    foreground: string;
    background: string;
}

export interface TouchTargetResult {
    width: number;
    height: number;
    passes: boolean;
    recommendation: string;
}

export interface AccessibilityReport {
    colorContrast: ColorContrastResult[];
    touchTargets: TouchTargetResult[];
    textSizes: { size: number; passes: boolean }[];
    score: number;
    issues: string[];
}

/**
 * Calculate relative luminance for a color
 * Based on WCAG 2.1 formula
 */
function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
        const sRGB = c / 255;
        return sRGB <= 0.03928
            ? sRGB / 12.92
            : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @returns Contrast ratio (1:1 to 21:1)
 */
export function calculateContrastRatio(
    fg: { r: number; g: number; b: number },
    bg: { r: number; g: number; b: number }
): number {
    const l1 = getLuminance(fg.r * 255, fg.g * 255, fg.b * 255);
    const l2 = getLuminance(bg.r * 255, bg.g * 255, bg.b * 255);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio passes WCAG standards
 */
export function checkColorContrast(
    fg: { r: number; g: number; b: number },
    bg: { r: number; g: number; b: number }
): ColorContrastResult {
    const ratio = calculateContrastRatio(fg, bg);
    return {
        ratio: Math.round(ratio * 100) / 100,
        passes: {
            AA: ratio >= 4.5,  // Normal text
            AAA: ratio >= 7,   // Enhanced
        },
        foreground: rgbToHex(fg),
        background: rgbToHex(bg),
    };
}

/**
 * Convert RGB to hex string
 */
function rgbToHex(color: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase();
}

/**
 * Minimum touch target size (44x44px recommended by WCAG)
 */
const MIN_TOUCH_TARGET = 44;

/**
 * Check if touch target size meets accessibility standards
 */
export function checkTouchTarget(width: number, height: number): TouchTargetResult {
    const passes = width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;
    return {
        width,
        height,
        passes,
        recommendation: passes
            ? '터치 타겟 크기가 적절합니다.'
            : `터치 타겟이 너무 작습니다. 최소 ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px 권장`,
    };
}

/**
 * Minimum text size (16px recommended for body text)
 */
const MIN_TEXT_SIZE = 12;
const RECOMMENDED_TEXT_SIZE = 16;

/**
 * Check if text size is accessible
 */
export function checkTextSize(fontSize: number): { size: number; passes: boolean; recommendation: string } {
    const passes = fontSize >= MIN_TEXT_SIZE;
    return {
        size: fontSize,
        passes,
        recommendation: fontSize >= RECOMMENDED_TEXT_SIZE
            ? '텍스트 크기가 적절합니다.'
            : fontSize >= MIN_TEXT_SIZE
                ? `권장 크기(${RECOMMENDED_TEXT_SIZE}px)보다 작습니다.`
                : `최소 크기(${MIN_TEXT_SIZE}px) 미만입니다. 가독성이 떨어질 수 있습니다.`,
    };
}

/**
 * Generate accessibility score (0-100)
 */
export function calculateAccessibilityScore(report: Omit<AccessibilityReport, 'score'>): number {
    let score = 100;

    // Deduct for color contrast failures
    const contrastFailures = report.colorContrast.filter(c => !c.passes.AA).length;
    score -= contrastFailures * 10;

    // Deduct for touch target failures
    const touchFailures = report.touchTargets.filter(t => !t.passes).length;
    score -= touchFailures * 5;

    // Deduct for text size failures
    const textFailures = report.textSizes.filter(t => !t.passes).length;
    score -= textFailures * 5;

    return Math.max(0, Math.min(100, score));
}
