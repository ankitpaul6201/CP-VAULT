import { READMEGenerator } from '../shared/utils/readme';
import { SubmissionMetadata, SyncHistory } from '../shared/types';

export function runReadmeTests() {
  const results: { name: string; success: boolean; error?: string }[] = [];

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      results.push({ name, success: true });
    } catch (err) {
      results.push({ name, success: false, error: err instanceof Error ? err.message : String(err) });
    }
  };

  const mockMeta: SubmissionMetadata = {
    platform: 'LeetCode',
    problemId: '0001',
    problemName: 'Two Sum',
    difficulty: 'Easy',
    language: 'C++',
    runtime: '4 ms',
    memory: '44.8 MB',
    submissionTime: '2026-07-11',
    status: 'Accepted',
    url: 'https://leetcode.com/problems/two-sum/',
    tags: ['Array', 'Hash Table'],
    code: 'int main() { return 0; }',
    problemStatement: 'Find two indices that add up to target.',
  };

  test('Individual Problem README Generator', () => {
    const readme = READMEGenerator.generateProblemREADME(mockMeta);
    if (!readme.includes('# Two Sum') || !readme.includes('## Problem Information') || !readme.includes('int main()')) {
      throw new Error(`Problem README generation is incorrect: ${readme}`);
    }
  });

  test('Root README Generator Statistics', () => {
    const history: SyncHistory = {
      logs: [
        { id: '1', platform: 'LeetCode', problemId: '0001', problemName: 'Two Sum', difficulty: 'Easy', language: 'C++', syncedAt: new Date().toISOString(), codeHash: 'abc' },
        { id: '2', platform: 'Codeforces', problemId: '71A', problemName: 'Way Too Long Words', difficulty: 'Medium', language: 'Python', syncedAt: new Date().toISOString(), codeHash: 'def' },
      ],
      streak: { currentStreak: 3, lastSolvedDate: '2026-07-11' },
    };

    const rootReadme = READMEGenerator.generateRootREADME(history, 'My-Coding-Solutions');
    if (!rootReadme.includes('Total Solved** | **2**') || !rootReadme.includes('LeetCode | **1**') || !rootReadme.includes('Codeforces | **1**') || !rootReadme.includes('Current Streak: `3 Days`')) {
      throw new Error(`Root README statistics parsing is incorrect: ${rootReadme}`);
    }
  });

  return results;
}
