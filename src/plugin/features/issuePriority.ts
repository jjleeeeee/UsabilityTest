/**
 * Issue Priority Module
 * Parses and categorizes UX issues by severity (Critical/Major/Minor)
 */

export type IssuePriority = 'CRITICAL' | 'MAJOR' | 'MINOR';

export interface Issue {
    text: string;
    priority: IssuePriority;
}

export interface CategorizedIssues {
    CRITICAL: Issue[];
    MAJOR: Issue[];
    MINOR: Issue[];
}

/**
 * Parse issue priority from AI response text
 * @param response AI response line containing priority indicator
 * @returns IssuePriority enum value
 */
export function parseIssuePriority(response: string): IssuePriority {
    const lowerResponse = response.toLowerCase();

    if (lowerResponse.includes('🔴') || lowerResponse.includes('critical')) {
        return 'CRITICAL';
    }

    if (lowerResponse.includes('🟡') || lowerResponse.includes('major')) {
        return 'MAJOR';
    }

    // Default to MINOR for unspecified or minor issues
    return 'MINOR';
}

/**
 * Get emoji representation for priority level
 * @param priority Issue priority level
 * @returns Emoji string
 */
export function getPriorityEmoji(priority: IssuePriority): string {
    const emojiMap: Record<IssuePriority, string> = {
        CRITICAL: '🔴',
        MAJOR: '🟡',
        MINOR: '🟢',
    };
    return emojiMap[priority];
}

/**
 * Categorize issues by priority level
 * @param issues Array of issues to categorize
 * @returns Object with issues grouped by priority
 */
export function categorizeIssuesByPriority(issues: Issue[]): CategorizedIssues {
    return {
        CRITICAL: issues.filter(issue => issue.priority === 'CRITICAL'),
        MAJOR: issues.filter(issue => issue.priority === 'MAJOR'),
        MINOR: issues.filter(issue => issue.priority === 'MINOR'),
    };
}

/**
 * Parse multiple issues from AI response
 * @param fullResponse Full AI response text
 * @returns Array of parsed issues with priorities
 */
export function parseIssuesFromResponse(fullResponse: string): Issue[] {
    const lines = fullResponse.split('\n').filter(line => line.trim());
    const issues: Issue[] = [];

    for (const line of lines) {
        // Look for lines that contain issue indicators
        if (line.includes('🔴') || line.includes('🟡') || line.includes('🟢') ||
            line.toLowerCase().includes('critical') ||
            line.toLowerCase().includes('major') ||
            line.toLowerCase().includes('minor')) {
            issues.push({
                text: line.trim(),
                priority: parseIssuePriority(line),
            });
        }
    }

    return issues;
}
