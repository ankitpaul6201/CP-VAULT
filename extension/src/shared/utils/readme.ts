import { SubmissionMetadata, SyncHistory } from '../types';

export const READMEGenerator = {
  /**
   * Generates a beautiful problem-specific README.md
   */
  generateProblemREADME(meta: SubmissionMetadata): string {
    const tagsBadges = meta.tags.length > 0 
      ? meta.tags.map(t => `\`${t}\``).join(' ') 
      : '*None*';

    return `# ${meta.problemName}

## Problem Information
- **Problem Number:** ${meta.problemId}
- **Platform:** [${meta.platform}](${meta.url})
- **Difficulty:** ${meta.difficulty}
- **Tags:** ${tagsBadges}
- **Language:** ${meta.language}
- **Runtime:** ${meta.runtime || 'N/A'}
- **Memory:** ${meta.memory || 'N/A'}
- **Submission Date:** ${meta.submissionTime}

---

## Problem Statement
${meta.problemStatement || 'No description available.'}

${meta.examples ? `### Examples\n${meta.examples}\n` : ''}
${meta.constraints ? `### Constraints\n${meta.constraints}\n` : ''}
${meta.notes ? `### Notes\n${meta.notes}\n` : ''}

---

## Solution
\`\`\`${this.getLanguageMarkdownSlug(meta.language)}
${meta.code}
\`\`\`

${meta.complexity ? `### Complexity\n${meta.complexity}\n` : ''}

---
*Auto-generated using [CP Vault](https://github.com/ankit/CP-Vault).*
`;
  },

  /**
   * Generates the root README.md containing total stats, platform breakdown, streaks and solved history.
   */
  generateRootREADME(history: SyncHistory, repoName: string): string {
    const totalSolved = history.logs.length;
    const streakDays = history.streak.currentStreak || 0;

    // Platform-wise counts
    const platforms = { LeetCode: 0, Codeforces: 0, CodeChef: 0, HackerRank: 0 };
    // Difficulty counts
    const difficulties = { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 };
    // Languages counts
    const languages: { [key: string]: number } = {};

    history.logs.forEach(log => {
      const p = log.platform as keyof typeof platforms;
      if (p in platforms) platforms[p]++;

      const diff = log.difficulty as keyof typeof difficulties;
      if (diff in difficulties) difficulties[diff]++;
      else difficulties['Unknown']++;

      const lang = log.language;
      languages[lang] = (languages[lang] || 0) + 1;
    });

    // Generate recent solved list (last 10)
    const sortedLogs = [...history.logs].sort(
      (a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime()
    );
    const latestSolvedRows = sortedLogs.slice(0, 10).map((log, index) => {
      const platformIcon = this.getPlatformIcon(log.platform);
      const difficultyColor = this.getDifficultyColor(log.difficulty);
      const path = `./${log.platform}/${log.difficulty !== 'Unknown' ? log.difficulty + '/' : ''}${log.problemId}%20-%20${encodeURIComponent(log.problemName)}`;
      return `| ${index + 1} | ${platformIcon} ${log.platform} | [${log.problemId} - ${log.problemName}](${path}) | <span style="color:${difficultyColor}; font-weight:bold;">${log.difficulty}</span> | \`${log.language}\` | ${new Date(log.syncedAt).toLocaleDateString()} |`;
    }).join('\n');

    const languageBadges = Object.entries(languages)
      .map(([lang, count]) => `\`${lang} (${count})\``)
      .join(' ');

    return `# CP Vault - ${repoName}

Welcome to my Competitive Programming repository! This repository stores all my accepted solutions automatically synced from various platforms using the CP Vault browser extension.

---

## 📊 Statistics

| Platform | Solved |
| :--- | :---: |
| LeetCode | **${platforms.LeetCode}** |
| Codeforces | **${platforms.Codeforces}** |
| CodeChef | **${platforms.CodeChef}** |
| HackerRank | **${platforms.HackerRank}** |
| **Total Solved** | **${totalSolved}** |

<br>

| Difficulty | Count |
| :--- | :---: |
| <span style="color:#00b8a3;">🟢 Easy</span> | **${difficulties.Easy}** |
| <span style="color:#ffc01e;">🟡 Medium</span> | **${difficulties.Medium}** |
| <span style="color:#ef4444;">🔴 Hard</span> | **${difficulties.Hard}** |

---

## 🔥 Current Streak: \`${streakDays} Days\`

*Keep solving daily!*

---

## 🛠️ Languages Used
${languageBadges || '*No solutions uploaded yet.*'}

---

## 📜 Latest Solved Problems

| # | Platform | Problem | Difficulty | Language | Synced At |
| :---: | :--- | :--- | :--- | :--- | :--- |
${latestSolvedRows || '| - | - | No solved problems yet. | - | - | - |'}

---

*This repository is automatically maintained and updated by [CP Vault](https://github.com/ankit/CP-Vault).*
`;
  },

  getLanguageMarkdownSlug(lang: string): string {
    const l = lang.toLowerCase();
    if (l.includes('c++')) return 'cpp';
    if (l.includes('cpp')) return 'cpp';
    if (l.includes('java')) return 'java';
    if (l.includes('python')) return 'python';
    if (l.includes('py')) return 'python';
    if (l.includes('javascript')) return 'javascript';
    if (l.includes('js')) return 'javascript';
    if (l.includes('typescript')) return 'typescript';
    if (l.includes('ts')) return 'typescript';
    if (l.includes('go')) return 'go';
    if (l.includes('rust')) return 'rust';
    if (l.includes('c#')) return 'csharp';
    if (l.includes('cs')) return 'csharp';
    if (l.includes('kotlin')) return 'kotlin';
    if (l.includes('swift')) return 'swift';
    if (l.includes('php')) return 'php';
    if (l.includes('ruby')) return 'ruby';
    return 'text';
  },

  getFileExtension(lang: string): string {
    const l = lang.toLowerCase();
    if (l.includes('c++') || l.includes('cpp')) return 'cpp';
    if (l.includes('java')) return 'java';
    if (l.includes('python') || l.includes('py')) return 'py';
    if (l.includes('typescript') || l.includes('ts')) return 'ts';
    if (l.includes('javascript') || l.includes('js')) return 'js';
    if (l.includes('go')) return 'go';
    if (l.includes('rust') || l.includes('rs')) return 'rs';
    if (l.includes('c#') || l.includes('cs')) return 'cs';
    if (l.includes('kotlin')) return 'kt';
    if (l.includes('swift')) return 'swift';
    if (l.includes('php')) return 'php';
    if (l.includes('ruby')) return 'rb';
    return 'txt';
  },

  getPlatformIcon(platform: string): string {
    switch (platform) {
      case 'LeetCode': return '💻';
      case 'Codeforces': return '🏆';
      case 'CodeChef': return '👨‍🍳';
      case 'HackerRank': return '🎯';
      default: return '❓';
    }
  },

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Easy': return '#00b8a3';
      case 'Medium': return '#ffc01e';
      case 'Hard': return '#ef4444';
      default: return '#9ca3af';
    }
  }
};
