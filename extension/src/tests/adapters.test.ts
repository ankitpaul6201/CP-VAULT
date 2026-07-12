import { LeetCodeAdapter } from '../content/adapters/leetcode';
import { HackerRankAdapter } from '../content/adapters/hackerrank';

// Simple lightweight mock test runner framework inside standard code files
export function runAdapterTests() {
  const results: { name: string; success: boolean; error?: string }[] = [];

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      results.push({ name, success: true });
    } catch (err) {
      results.push({ name, success: false, error: err instanceof Error ? err.message : String(err) });
    }
  };

  test('LeetCode Adapter is defined', () => {
    if (!LeetCodeAdapter || typeof LeetCodeAdapter.initialize !== 'function') {
      throw new Error('LeetCodeAdapter is not properly defined');
    }
  });

  test('HackerRank Difficulty Normalization', () => {
    const easyDiff = HackerRankAdapter._normalizeDifficulty('easy-level');
    const mediumDiff = HackerRankAdapter._normalizeDifficulty('Medium Challenge');
    if (easyDiff !== 'Easy' || mediumDiff !== 'Medium') {
      throw new Error(`HackerRank difficulty normalization failed: ${easyDiff}, ${mediumDiff}`);
    }
  });

  return results;
}

