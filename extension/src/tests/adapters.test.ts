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

  test('LeetCode HTML Cleaning', () => {
    const rawHtml = '<div class="content"><p>Given an array of integers <strong>nums</strong>...</p><code>Two Sum</code></div>';
    const cleaned = LeetCodeAdapter.cleanHtml(rawHtml);
    if (!cleaned.includes('**nums**') || !cleaned.includes('`Two Sum`')) {
      throw new Error(`LeetCode HTML cleaning returned unexpected format: ${cleaned}`);
    }
  });

  test('HackerRank Difficulty Normalization', () => {
    const easyDiff = HackerRankAdapter.normalizeDifficulty('easy-level');
    const mediumDiff = HackerRankAdapter.normalizeDifficulty('Medium Challenge');
    if (easyDiff !== 'Easy' || mediumDiff !== 'Medium') {
      throw new Error(`HackerRank difficulty normalization failed: ${easyDiff}, ${mediumDiff}`);
    }
  });

  return results;
}
