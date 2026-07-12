import { SubmissionMetadata } from '../../shared/types';
import { Logger } from '../../shared/utils/logger';

export const LeetCodeAdapter = {
  parse(_url: string, responseText: string) {
    try {
      if (!responseText) return;
      const data = JSON.parse(responseText);

      // Check if this response contains submission details
      const submission = data?.data?.submissionDetails || data?.data?.submissionDetail;
      if (!submission) return;

      // LeetCode Status Code 10 represents "Accepted"
      const isAccepted = submission.statusCode === 10 || submission.statusDisplay === 'Accepted';
      if (!isAccepted) {
        Logger.info(`LeetCode submission detected but status is ${submission.statusDisplay || submission.statusCode} (Not Accepted).`);
        return;
      }

      Logger.info('LeetCode Accepted submission detected! Parsing details...');

      const question = submission.question;
      const tags = (question?.topicTags || []).map((t: any) => t.name);

      const metadata: SubmissionMetadata = {
        platform: 'LeetCode',
        problemId: question.questionFrontendId || question.questionId || '0000',
        problemName: question.title,
        difficulty: (question.difficulty || 'Unknown') as any,
        language: submission.lang?.verboseName || submission.lang?.name || 'C++',
        runtime: submission.runtimeDisplay || `${submission.runtime} ms`,
        memory: submission.memoryDisplay || `${submission.memory / 1000000} MB`,
        submissionTime: new Date().toISOString().split('T')[0],
        status: 'Accepted',
        url: `https://leetcode.com/problems/${question.titleSlug}/`,
        tags,
        code: submission.code,
        problemStatement: this.cleanHtml(question.content || ''),
        examples: this.extractExamples(question.content || ''),
        constraints: this.extractConstraints(question.content || '')
      };

      // Send to background service worker
      chrome.runtime.sendMessage({
        action: 'SUBMISSION_DETECTED',
        submission: metadata
      }, (response) => {
        if (chrome.runtime.lastError) {
          Logger.error('Failed to communicate with background service worker:', chrome.runtime.lastError);
        } else if (response?.success) {
          Logger.success('LeetCode solution sync request completed.');
        } else {
          Logger.error('Sync failed:', response?.error);
        }
      });
    } catch (err) {
      Logger.error('Failed to parse LeetCode submission graphql response:', err);
    }
  },

  // Basic HTML-to-Markdown cleaner
  cleanHtml(html: string): string {
    if (!html) return '';
    return html
      .replace(/<div[^>]*>/g, '')
      .replace(/<\/div>/g, '')
      .replace(/<p[^>]*>/g, '')
      .replace(/<\/p>/g, '\n')
      .replace(/<strong[^>]*>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<em[^>]*>/g, '*')
      .replace(/<\/em>/g, '*')
      .replace(/<code[^>]*>/g, '`')
      .replace(/<\/code>/g, '`')
      .replace(/<pre[^>]*>/g, '\n```\n')
      .replace(/<\/pre>/g, '\n```\n')
      .replace(/<ul[^>]*>/g, '\n')
      .replace(/<\/ul>/g, '\n')
      .replace(/<li[^>]*>/g, '- ')
      .replace(/<\/li>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/<span[^>]*>/g, '')
      .replace(/<\/span>/g, '')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  },

  extractExamples(html: string): string {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const preTags = tempDiv.querySelectorAll('pre');
    let examples = '';
    preTags.forEach((pre, index) => {
      examples += `**Example ${index + 1}:**\n\`\`\`\n${pre.innerText.trim()}\n\`\`\`\n\n`;
    });
    return examples;
  },

  extractConstraints(html: string): string {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const constraintLists = tempDiv.querySelectorAll('ul');
    let constraints = '';
    constraintLists.forEach(ul => {
      if (ul.previousElementSibling?.textContent?.toLowerCase().includes('constraints')) {
        ul.querySelectorAll('li').forEach(li => {
          constraints += `- ${li.innerText.trim()}\n`;
        });
      }
    });
    // Fallback if structured ul constraints not found
    if (!constraints) {
      const match = html.match(/<strong>Constraints:<\/strong>[\s\S]*?<\/ul>/);
      if (match) {
        const clean = match[0].replace(/<[^>]*>/g, '').trim();
        constraints = clean.replace('Constraints:', '').trim();
      }
    }
    return constraints;
  }
};
