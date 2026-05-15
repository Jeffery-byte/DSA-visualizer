import type { Algorithm, Frame, DPTableState } from '../../types';

// ─── Climbing Stairs (1D DP) ───────────────────────────────────────────────────
const climbingStairsCode = `function climbStairs(n) {
  if (n <= 2) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  dp[2] = 2;

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }

  return dp[n];
}`;

function generateClimbingStairs(input: Record<string, unknown>): Frame[] {
  const n = (input.n as number) ?? 6;
  const frames: Frame[] = [];
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1; if (n >= 2) dp[2] = 2;

  const makeDP = (highlights: DPTableState['highlights']): DPTableState => ({
    is1D: true,
    data: [dp.slice(0, n + 1)],
    dpArray: dp.slice(0, n + 1),
    highlights,
    colLabels: Array.from({ length: n + 1 }, (_, i) => `dp[${i}]`),
  });

  frames.push({ line: 1, description: `Climbing Stairs: n=${n} stairs, 1 or 2 steps at a time`, dpTable: makeDP([]) });

  frames.push({ line: 3, description: 'Initialize dp[1]=1, dp[2]=2 (base cases)', dpTable: makeDP([{ row: 0, col: 1, color: 'dp-source' }, { row: 0, col: 2, color: 'dp-source' }]) });

  for (let i = 3; i <= n; i++) {
    frames.push({
      line: 7,
      description: `dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${dp[i-1]} + ${dp[i-2]}`,
      dpTable: makeDP([{ row: 0, col: i - 1, color: 'dp-source' }, { row: 0, col: i - 2, color: 'dp-source' }, { row: 0, col: i, color: 'dp-current' }]),
    });
    dp[i] = dp[i - 1] + dp[i - 2];
    frames.push({
      line: 8,
      description: `dp[${i}] = ${dp[i]} ways to climb ${i} stairs`,
      dpTable: makeDP([{ row: 0, col: i, color: 'found' }]),
    });
  }

  frames.push({ line: 11, description: `Answer: ${dp[n]} ways to climb ${n} stairs`, dpTable: makeDP([{ row: 0, col: n, color: 'result' }]) });
  return frames;
}

// ─── Coin Change (1D DP) ──────────────────────────────────────────────────────
const coinChangeCode = `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;   // 0 coins needed for amount 0

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) {
        dp[a] = Math.min(dp[a], dp[a - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`;

function generateCoinChange(input: Record<string, unknown>): Frame[] {
  const coins: number[] = [...((input.coins as number[]) ?? [1, 2, 5])];
  const amount = (input.amount as number) ?? 7;
  const frames: Frame[] = [];
  const dp: number[] = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  const displayDp = (): (number | string)[] => dp.map(v => v === Infinity ? '∞' : v);

  const makeDP = (highlights: DPTableState['highlights']): DPTableState => ({
    is1D: true,
    data: [displayDp()],
    dpArray: displayDp(),
    highlights,
    colLabels: Array.from({ length: amount + 1 }, (_, i) => `${i}`),
  });

  frames.push({ line: 1, description: `Coin Change: coins=[${coins}], amount=${amount}`, dpTable: makeDP([]) });
  frames.push({ line: 3, description: 'Init dp[0]=0 (base), rest=∞', dpTable: makeDP([{ row: 0, col: 0, color: 'dp-source' }]) });

  for (let a = 1; a <= amount; a++) {
    frames.push({ line: 4, description: `Computing dp[${a}]: min coins for amount ${a}`, dpTable: makeDP([{ row: 0, col: a, color: 'dp-current' }]) });

    for (const coin of coins) {
      if (coin <= a) {
        const prev = dp[a - coin];
        const candidate = prev === Infinity ? Infinity : prev + 1;
        frames.push({
          line: 7,
          description: `coin=${coin}: dp[${a-coin}]=${prev === Infinity ? '∞' : prev} + 1 = ${candidate === Infinity ? '∞' : candidate}${candidate < dp[a] ? ' ← new min!' : ''}`,
          dpTable: makeDP([{ row: 0, col: a, color: 'dp-current' }, { row: 0, col: a - coin, color: 'dp-source' }]),
        });
        if (candidate < dp[a]) dp[a] = candidate;
      }
    }

    frames.push({ line: 8, description: `dp[${a}] = ${dp[a] === Infinity ? '∞' : dp[a]}`, dpTable: makeDP([{ row: 0, col: a, color: 'found' }]) });
  }

  const ans = dp[amount] === Infinity ? -1 : dp[amount];
  frames.push({ line: 13, description: `Answer: ${ans === -1 ? 'impossible' : `${ans} coins`}`, dpTable: makeDP([{ row: 0, col: amount, color: 'result' }]) });
  return frames;
}

// ─── Longest Common Subsequence (2D DP) ───────────────────────────────────────
const lcsCode = `function lcs(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({length: m+1}, () => Array(n+1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i-1] === s2[j-1]) {
        dp[i][j] = dp[i-1][j-1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
      }
    }
  }

  return dp[m][n];
}`;

function generateLCS(input: Record<string, unknown>): Frame[] {
  const s1 = (input.s1 as string) ?? 'ABCBDAB';
  const s2 = (input.s2 as string) ?? 'BDCAB';
  const m = s1.length, n = s2.length;
  const frames: Frame[] = [];
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  const makeDP = (highlights: DPTableState['highlights']): DPTableState => ({
    data: dp.map(r => [...r]),
    highlights,
    rowLabels: ['', ...s1.split('')],
    colLabels: ['', ...s2.split('')],
  });

  frames.push({ line: 1, description: `LCS of "${s1}" and "${s2}"`, dpTable: makeDP([]) });
  frames.push({ line: 3, description: 'Init dp table with zeros (base cases)', dpTable: makeDP([]) });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      frames.push({ line: 6, description: `Compare s1[${i-1}]='${s1[i-1]}' with s2[${j-1}]='${s2[j-1]}'`, dpTable: makeDP([{ row: i, col: j, color: 'dp-current' }, { row: i - 1, col: j - 1, color: 'dp-source' }, { row: i - 1, col: j, color: 'dp-source' }, { row: i, col: j - 1, color: 'dp-source' }]) });

      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        frames.push({ line: 8, description: `Match! '${s1[i-1]}'='${s2[j-1]}' → dp[${i}][${j}] = dp[${i-1}][${j-1}]+1 = ${dp[i][j]}`, dpTable: makeDP([{ row: i, col: j, color: 'found' }, { row: i - 1, col: j - 1, color: 'dp-source' }]) });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        frames.push({ line: 10, description: `No match: dp[${i}][${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`, dpTable: makeDP([{ row: i, col: j, color: 'dp-current' }, { row: i - 1, col: j, color: 'dp-source' }, { row: i, col: j - 1, color: 'dp-source' }]) });
      }
    }
  }

  frames.push({ line: 16, description: `LCS length = ${dp[m][n]}`, dpTable: makeDP([{ row: m, col: n, color: 'result' }]) });
  return frames;
}

// ─── Unique Paths (2D DP) ──────────────────────────────────────────────────────
const uniquePathsCode = `function uniquePaths(m, n) {
  const dp = Array.from({length: m}, () => Array(n).fill(1));

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i-1][j] + dp[i][j-1];
    }
  }

  return dp[m-1][n-1];
}`;

function generateUniquePaths(input: Record<string, unknown>): Frame[] {
  const m = (input.m as number) ?? 4;
  const n = (input.n as number) ?? 4;
  const frames: Frame[] = [];
  const dp: number[][] = Array.from({ length: m }, () => Array(n).fill(1));

  const makeDP = (highlights: DPTableState['highlights']): DPTableState => ({
    data: dp.map(r => [...r]),
    highlights,
    rowLabels: Array.from({ length: m }, (_, i) => `r${i}`),
    colLabels: Array.from({ length: n }, (_, j) => `c${j}`),
  });

  frames.push({ line: 1, description: `Unique Paths in ${m}×${n} grid (right/down only)`, dpTable: makeDP([]) });
  frames.push({ line: 2, description: 'Init: all 1s (first row/col have exactly 1 path)', dpTable: makeDP([...Array.from({ length: m }, (_, i) => ({ row: i, col: 0, color: 'dp-source' as const })), ...Array.from({ length: n }, (_, j) => ({ row: 0, col: j, color: 'dp-source' as const }))]) });

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      frames.push({
        line: 5,
        description: `dp[${i}][${j}] = dp[${i-1}][${j}](${dp[i-1][j]}) + dp[${i}][${j-1}](${dp[i][j-1]}) = ${dp[i][j]}`,
        dpTable: makeDP([{ row: i, col: j, color: 'found' }, { row: i - 1, col: j, color: 'dp-source' }, { row: i, col: j - 1, color: 'dp-source' }]),
      });
    }
  }

  frames.push({ line: 10, description: `Total unique paths = ${dp[m-1][n-1]}`, dpTable: makeDP([{ row: m - 1, col: n - 1, color: 'result' }]) });
  return frames;
}

export const dpAlgorithms: Algorithm[] = [
  {
    id: 'climbing-stairs',
    name: 'Climbing Stairs',
    category: 'dp-1d',
    description: '1D DP: dp[i] = dp[i-1] + dp[i-2], ways to climb i stairs.',
    code: climbingStairsCode,
    defaultInput: { n: 6 },
    generate: generateClimbingStairs,
  },
  {
    id: 'coin-change',
    name: 'Coin Change',
    category: 'dp-1d',
    description: '1D DP: fewest coins to make amount; try each coin denomination.',
    code: coinChangeCode,
    defaultInput: { coins: [1, 2, 5], amount: 7 },
    generate: generateCoinChange,
  },
  {
    id: 'lcs',
    name: 'Longest Common Subsequence',
    category: 'dp-2d',
    description: '2D DP: compare chars, match diagonally or take max of neighbors.',
    code: lcsCode,
    defaultInput: { s1: 'ABCBDAB', s2: 'BDCAB' },
    generate: generateLCS,
  },
  {
    id: 'unique-paths',
    name: 'Unique Paths',
    category: 'dp-2d',
    description: '2D DP: paths to reach bottom-right = paths from top + from left.',
    code: uniquePathsCode,
    defaultInput: { m: 4, n: 4 },
    generate: generateUniquePaths,
  },
];
