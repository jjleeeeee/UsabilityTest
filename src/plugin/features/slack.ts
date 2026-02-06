/**
 * Slack Notification Module
 * Sends analysis results to Slack via webhook
 */

export interface SlackMessage {
    text: string;
    blocks?: SlackBlock[];
}

export interface SlackBlock {
    type: 'section' | 'header' | 'divider' | 'context';
    text?: { type: 'plain_text' | 'mrkdwn'; text: string };
    fields?: { type: 'mrkdwn'; text: string }[];
}

const WEBHOOK_KEY = 'usability-tester-slack-webhook';

/**
 * Save Slack webhook URL
 */
export async function saveWebhookUrl(url: string): Promise<void> {
    if (!validateWebhookUrl(url)) {
        throw new Error('유효하지 않은 Slack Webhook URL입니다.');
    }
    await figma.clientStorage.setAsync(WEBHOOK_KEY, url);
}

/**
 * Load Slack webhook URL
 */
export async function loadWebhookUrl(): Promise<string | null> {
    return await figma.clientStorage.getAsync(WEBHOOK_KEY) as string | null;
}

/**
 * Clear Slack webhook URL
 */
export async function clearWebhookUrl(): Promise<void> {
    await figma.clientStorage.deleteAsync(WEBHOOK_KEY);
}

/**
 * Validate Slack webhook URL format
 */
export function validateWebhookUrl(url: string): boolean {
    return url.startsWith('https://hooks.slack.com/services/');
}

/**
 * Build Slack message blocks from analysis result
 */
export function buildSlackMessage(
    title: string,
    score: number,
    issues: { text: string; priority: string }[],
    summary: string
): SlackMessage {
    const blocks: SlackBlock[] = [
        {
            type: 'header',
            text: { type: 'plain_text', text: `🎨 ${title}` },
        },
        { type: 'divider' },
        {
            type: 'section',
            text: { type: 'mrkdwn', text: `*사용성 점수*: ${score}/10` },
        },
    ];

    // Group issues by priority
    const critical = issues.filter(i => i.priority === 'CRITICAL');
    const major = issues.filter(i => i.priority === 'MAJOR');
    const minor = issues.filter(i => i.priority === 'MINOR');

    if (critical.length > 0) {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `🔴 *Critical Issues* (${critical.length})\n${critical.map(i => `• ${i.text}`).join('\n')}`,
            },
        });
    }

    if (major.length > 0) {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `🟡 *Major Issues* (${major.length})\n${major.map(i => `• ${i.text}`).join('\n')}`,
            },
        });
    }

    if (minor.length > 0) {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `🟢 *Minor Issues* (${minor.length})\n${minor.map(i => `• ${i.text}`).join('\n')}`,
            },
        });
    }

    blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*요약*\n${summary}` },
    });

    blocks.push({
        type: 'context',
        text: { type: 'mrkdwn', text: `_UsabilityTester에서 생성됨 | ${new Date().toLocaleString('ko-KR')}_` },
    });

    return {
        text: `${title} - 사용성 점수: ${score}/10`,
        blocks,
    };
}

/**
 * Send message to Slack webhook
 */
export async function sendToSlack(webhookUrl: string, message: SlackMessage): Promise<boolean> {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        });
        return response.ok;
    } catch (error) {
        console.error('Slack notification failed:', error);
        return false;
    }
}

/**
 * Send analysis result to saved Slack webhook
 */
export async function notifySlack(
    title: string,
    score: number,
    issues: { text: string; priority: string }[],
    summary: string
): Promise<boolean> {
    const webhookUrl = await loadWebhookUrl();
    if (!webhookUrl) {
        throw new Error('Slack Webhook URL이 설정되지 않았습니다.');
    }

    const message = buildSlackMessage(title, score, issues, summary);
    return sendToSlack(webhookUrl, message);
}
