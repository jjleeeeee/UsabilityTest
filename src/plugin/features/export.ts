/**
 * Export Module
 * Generates shareable HTML/PDF reports
 */

export interface ReportSection {
    title: string;
    content: string;
    type: 'text' | 'list' | 'score' | 'image';
}

export interface ExportOptions {
    format: 'html' | 'markdown';
    includeScreenshots: boolean;
    includeSummary: boolean;
    language: 'ko' | 'en';
}

/**
 * Generate HTML report from analysis results
 */
export function generateHtmlReport(
    title: string,
    sections: ReportSection[],
    options: ExportOptions
): string {
    const css = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; }
      h1 { color: #1a1a1a; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
      h2 { color: #4f46e5; margin-top: 30px; }
      .score { font-size: 48px; font-weight: bold; color: #6366f1; text-align: center; padding: 20px; background: #f5f3ff; border-radius: 12px; margin: 20px 0; }
      ul { line-height: 1.8; }
      .critical { color: #dc2626; }
      .major { color: #d97706; }
      .minor { color: #059669; }
      .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
      img { max-width: 100%; border-radius: 8px; margin: 10px 0; }
    </style>
  `;

    const date = new Date().toLocaleDateString(options.language === 'ko' ? 'ko-KR' : 'en-US');

    const body = sections.map(section => {
        switch (section.type) {
            case 'score':
                return `<h2>${section.title}</h2><div class="score">${section.content}</div>`;
            case 'list':
                const items = section.content.split('\n').filter(Boolean);
                const listItems = items.map(item => {
                    let className = '';
                    if (item.includes('🔴') || item.toLowerCase().includes('critical')) className = 'critical';
                    else if (item.includes('🟡') || item.toLowerCase().includes('major')) className = 'major';
                    else if (item.includes('🟢') || item.toLowerCase().includes('minor')) className = 'minor';
                    return `<li class="${className}">${item}</li>`;
                }).join('');
                return `<h2>${section.title}</h2><ul>${listItems}</ul>`;
            case 'image':
                return `<h2>${section.title}</h2><img src="${section.content}" alt="${section.title}">`;
            default:
                return `<h2>${section.title}</h2><p>${section.content}</p>`;
        }
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="${options.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${css}
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">${options.language === 'ko' ? '생성일' : 'Generated'}: ${date}</p>
  ${body}
</body>
</html>`;
}

/**
 * Generate Markdown report
 */
export function generateMarkdownReport(
    title: string,
    sections: ReportSection[],
    options: ExportOptions
): string {
    const date = new Date().toLocaleDateString(options.language === 'ko' ? 'ko-KR' : 'en-US');

    const body = sections.map(section => {
        switch (section.type) {
            case 'score':
                return `## ${section.title}\n\n**${section.content}**\n`;
            case 'list':
                const items = section.content.split('\n').filter(Boolean);
                return `## ${section.title}\n\n${items.map(item => `- ${item}`).join('\n')}\n`;
            case 'image':
                return `## ${section.title}\n\n![${section.title}](${section.content})\n`;
            default:
                return `## ${section.title}\n\n${section.content}\n`;
        }
    }).join('\n');

    return `# ${title}

*${options.language === 'ko' ? '생성일' : 'Generated'}: ${date}*

${body}`;
}

/**
 * Download file in browser context
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export report with selected format
 */
export function exportReport(
    title: string,
    sections: ReportSection[],
    options: ExportOptions
): string {
    if (options.format === 'html') {
        return generateHtmlReport(title, sections, options);
    }
    return generateMarkdownReport(title, sections, options);
}
