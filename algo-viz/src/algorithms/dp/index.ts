import type { Algorithm, Frame, DPTableState } from '../../types';

// ─── Climbing Stairs ──────────────────────────────────────────────────────────
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
  frames.push({ line: 3, description: 'Base cases: dp[1]=1, dp[2]=2', dpTable: makeDP([{ row: 0, col: 1, color: 'dp-source' }, { row: 0, col: 2, color: 'dp-source' }]) });

  for (let i = 3; i <= n; i++) {
    frames.push({
      line: 6,
      description: `dp[${i}] = dp[${i-1}](${dp[i-1]}) + dp[${i-2}](${dp[i-2]})`,
      dpTable: makeDP([{ row: 0, col: i - 1, color: 'dp-source' }, { row: 0, col: i - 2, color: 'dp-source' }, { row: 0, col: i, color: 'dp-current' }]),
    });
    dp[i] = dp[i - 1] + dp[i - 2];
    frames.push({ line: 7, description: `dp[${i}] = ${dp[i]} ways to climb ${i} stairs`, dpTable: makeDP([{ row: 0, col: i, color: 'found' }]) });
  }

  frames.push({ line: 10, description: `Answer: ${dp[n]} ways to climb ${n} stairs`, dpTable: makeDP([{ row: 0, col: n, color: 'result' }]) });
  return frames;
}

// ─── Coin Change ──────────────────────────────────────────────────────────────
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
  frames.push({ line: 3, description: 'Init: dp[0]=0 (0 coins for amount 0), rest=∞', dpTable: makeDP([{ row: 0, col: 0, color: 'dp-source' }]) });

  for (let a = 1; a <= amount; a++) {
    frames.push({ line: 5, description: `Computing dp[${a}]: min coins for amount ${a}`, dpTable: makeDP([{ row: 0, col: a, color: 'dp-current' }]) });

    for (const coin of coins) {
      if (coin <= a) {
        const prev = dp[a - coin];
        const candidate = prev === Infinity ? Infinity : prev + 1;
        frames.push({
          line: 8,
          description: `coin=${coin}: dp[${a-coin}]=${prev === Infinity ? '∞' : prev}+1=${candidate === Infinity ? '∞' : candidate}${candidate < dp[a] ? ' ← new min!' : ''}`,
          dpTable: makeDP([{ row: 0, col: a, color: 'dp-current' }, { row: 0, col: a - coin, color: 'dp-source' }]),
        });
        if (candidate < dp[a]) dp[a] = candidate;
      }
    }

    frames.push({ line: 9, description: `dp[${a}] = ${dp[a] === Infinity ? '∞' : dp[a]}`, dpTable: makeDP([{ row: 0, col: a, color: 'found' }]) });
  }

  const ans = dp[amount] === Infinity ? -1 : dp[amount];
  frames.push({ line: 12, description: `Answer: ${ans === -1 ? 'impossible' : `${ans} coins`}`, dpTable: makeDP([{ row: 0, col: amount, color: 'result' }]) });
  return frames;
}

// ─── LCS ─────────────────────────────────────────────────────────────────────
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
  frames.push({ line: 3, description: 'Init dp table with zeros (base cases: empty string)', dpTable: makeDP([]) });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      frames.push({ line: 5, description: `Compare s1[${i-1}]='${s1[i-1]}' with s2[${j-1}]='${s2[j-1]}'`, dpTable: makeDP([{ row: i, col: j, color: 'dp-current' }, { row: i-1, col: j-1, color: 'dp-source' }, { row: i-1, col: j, color: 'dp-source' }, { row: i, col: j-1, color: 'dp-source' }]) });

      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        frames.push({ line: 7, description: `Match! '${s1[i-1]}'='${s2[j-1]}' → dp[${i}][${j}] = dp[${i-1}][${j-1}]+1 = ${dp[i][j]}`, dpTable: makeDP([{ row: i, col: j, color: 'found' }, { row: i-1, col: j-1, color: 'dp-source' }]) });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        frames.push({ line: 9, description: `No match → dp[${i}][${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`, dpTable: makeDP([{ row: i, col: j, color: 'dp-current' }, { row: i-1, col: j, color: 'dp-source' }, { row: i, col: j-1, color: 'dp-source' }]) });
      }
    }
  }

  frames.push({ line: 14, description: `LCS length = ${dp[m][n]}`, dpTable: makeDP([{ row: m, col: n, color: 'result' }]) });
  return frames;
}

// ─── Unique Paths ─────────────────────────────────────────────────────────────
function generateUniquePaths(input: Record<string, unknown>): Frame[] {
  const m = (input.m as number) ?? 4, n = (input.n as number) ?? 4;
  const frames: Frame[] = [];
  const dp: number[][] = Array.from({ length: m }, () => Array(n).fill(1));

  const makeDP = (highlights: DPTableState['highlights']): DPTableState => ({
    data: dp.map(r => [...r]),
    highlights,
    rowLabels: Array.from({ length: m }, (_, i) => `r${i}`),
    colLabels: Array.from({ length: n }, (_, j) => `c${j}`),
  });

  frames.push({ line: 1, description: `Unique Paths in ${m}×${n} grid (right/down only)`, dpTable: makeDP([]) });
  frames.push({ line: 2, description: 'Init: first row and column = 1 (only one way along the edge)', dpTable: makeDP([...Array.from({ length: m }, (_, i) => ({ row: i, col: 0, color: 'dp-source' as const })), ...Array.from({ length: n }, (_, j) => ({ row: 0, col: j, color: 'dp-source' as const }))]) });

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      frames.push({
        line: 5,
        description: `dp[${i}][${j}] = dp[${i-1}][${j}](${dp[i-1][j]}) + dp[${i}][${j-1}](${dp[i][j-1]}) = ${dp[i][j]}`,
        dpTable: makeDP([{ row: i, col: j, color: 'found' }, { row: i-1, col: j, color: 'dp-source' }, { row: i, col: j-1, color: 'dp-source' }]),
      });
    }
  }

  frames.push({ line: 9, description: `Total unique paths = ${dp[m-1][n-1]}`, dpTable: makeDP([{ row: m-1, col: n-1, color: 'result' }]) });
  return frames;
}

export const dpAlgorithms: Algorithm[] = [
  {
    id: 'climbing-stairs',
    name: 'Climbing Stairs',
    category: 'dp-1d',
    description: 'dp[i] = dp[i−1] + dp[i−2]: ways to reach stair i = ways from (i−1) taking 1 step + ways from (i−2) taking 2 steps.',
    complexity: {
      time: 'O(n)',
      space: 'O(n) → O(1) optimised',
      reasoning:
        'We compute each dp[i] exactly once in a single left-to-right pass — O(n) time. Each value only depends on the two preceding values, so an optimised version stores only two variables (prev1, prev2) instead of the full array — O(1) space. The array version shown here uses O(n) space. This is the exact same recurrence as Fibonacci, but with DP avoiding the O(2^n) exponential blowup.',
    },
    codes: {
      javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  dp[2] = 2;

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}`,
      typescript: `function climbStairs(n: number): number {
  if (n <= 2) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  dp[2] = 2;

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}`,
      python: `def climb_stairs(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2

    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]

    return dp[n]`,
      java: `public int climbStairs(int n) {
    if (n <= 2) return n;
    int[] dp = new int[n + 1];
    dp[1] = 1;
    dp[2] = 2;

    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }

    return dp[n];
}`,
      c: `int climbStairs(int n) {
    if (n <= 2) return n;
    int dp[n + 1];
    dp[1] = 1; dp[2] = 2;

    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }

    return dp[n];
}`,
    },
    lineMap: {
      typescript: { 1: 1, 3: 3, 6: 7, 7: 8, 10: 11 },
      python:     { 1: 1, 3: 4, 6: 7, 7: 8, 10: 10 },
      java:       { 1: 1, 3: 3, 6: 7, 7: 8, 10: 11 },
      c:          { 1: 1, 3: 3, 6: 6, 7: 7, 10: 10 },
    },
    defaultInput: { n: 6 },
    generate: generateClimbingStairs,
  },
  {
    id: 'coin-change',
    name: 'Coin Change',
    category: 'dp-1d',
    description: 'Bottom-up DP: for each amount a, try every coin c and take dp[a] = min(dp[a], dp[a−c]+1).',
    complexity: {
      time: 'O(amount × coins)',
      space: 'O(amount)',
      reasoning:
        'The outer loop runs `amount` times; the inner loop runs `coins` times for each amount — total O(amount × coins). The dp array has (amount + 1) entries, giving O(amount) space. This is significantly better than the naive recursive O(coins^amount) exponential approach. Note: BFS on the amount-space graph also gives O(amount × coins) but with O(amount) queue space instead of a dp array.',
    },
    codes: {
      javascript: `function coinChange(coins, amount) {
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
}`,
      typescript: `function coinChange(coins: number[], amount: number): number {
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
}`,
      python: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0   # 0 coins for amount 0

    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)

    return dp[amount] if dp[amount] != float('inf') else -1`,
      java: `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);   // sentinel > any valid answer
    dp[0] = 0;

    for (int a = 1; a <= amount; a++) {
        for (int coin : coins) {
            if (coin <= a) {
                dp[a] = Math.min(dp[a], dp[a - coin] + 1);
            }
        }
    }

    return dp[amount] > amount ? -1 : dp[amount];
}`,
      c: `int coinChange(int* coins, int coinsLen, int amount) {
    int* dp = malloc((amount+1) * sizeof(int));
    for (int i=0;i<=amount;i++) dp[i] = amount+1;
    dp[0] = 0;

    for (int a = 1; a <= amount; a++) {
        for (int j = 0; j < coinsLen; j++) {
            if (coins[j] <= a) {
                int cand = dp[a - coins[j]] + 1;
                if (cand < dp[a]) dp[a] = cand;
            }
        }
    }

    return dp[amount] > amount ? -1 : dp[amount];
}`,
    },
    lineMap: {
      typescript: { 1: 1, 3: 3, 5: 5, 8: 8, 12: 13 },
      python:     { 1: 1, 3: 3, 5: 5, 8: 7, 12: 9  },
      java:       { 1: 1, 3: 3, 5: 5, 8: 8, 12: 13 },
      c:          { 1: 1, 3: 3, 5: 6, 8: 8, 12: 13 },
    },
    defaultInput: { coins: [1, 2, 5], amount: 7 },
    generate: generateCoinChange,
  },
  {
    id: 'lcs',
    name: 'Longest Common Subsequence',
    category: 'dp-2d',
    description: 'dp[i][j]: LCS of s1[0..i−1] and s2[0..j−1]. Match → diagonal+1; no match → max of above/left.',
    complexity: {
      time: 'O(m × n)',
      space: 'O(m × n) → O(min(m,n)) optimised',
      reasoning:
        'We fill an (m+1) × (n+1) table, computing each cell in O(1) time, giving O(m×n) total. Space is the full table O(m×n), but since dp[i][j] only depends on the previous row, we can compress to two rows or even one row with careful overwriting — O(min(m,n)) space. Backtracking through the table to reconstruct the actual subsequence (not just its length) is O(m+n) additional work.',
    },
    codes: {
      javascript: `function lcs(s1, s2) {
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
}`,
      typescript: `function lcs(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp: number[][] = Array.from({length: m+1}, () => Array(n+1).fill(0));

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
}`,
      python: `def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    return dp[m][n]`,
      java: `public int lcs(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    int[][] dp = new int[m + 1][n + 1];

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1.charAt(i-1) == s2.charAt(j-1)) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }
    }

    return dp[m][n];
}`,
      c: `int lcs(char* s1, char* s2) {
    int m = strlen(s1), n = strlen(s2);
    int dp[m+1][n+1];
    memset(dp, 0, sizeof(dp));

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i-1] == s2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = dp[i-1][j] > dp[i][j-1]
                          ? dp[i-1][j] : dp[i][j-1];
            }
        }
    }

    return dp[m][n];
}`,
    },
    lineMap: {
      typescript: { 1: 1, 3: 3, 5: 5, 7: 7, 9: 9, 14: 15 },
      python:     { 1: 1, 3: 3, 5: 5, 7: 7, 9: 9, 14: 12 },
      java:       { 1: 1, 3: 3, 5: 5, 7: 7, 9: 9, 14: 15 },
      c:          { 1: 1, 3: 3, 5: 6, 7: 8, 9: 10, 14: 14 },
    },
    defaultInput: { s1: 'ABCBDAB', s2: 'BDCAB' },
    generate: generateLCS,
  },
  {
    id: 'unique-paths',
    name: 'Unique Paths',
    category: 'dp-2d',
    description: 'dp[i][j] = dp[i−1][j] + dp[i][j−1]: paths to a cell = paths arriving from above + paths arriving from the left.',
    complexity: {
      time: 'O(m × n)',
      space: 'O(m × n) → O(n) optimised',
      reasoning:
        'We fill each cell of the m×n grid once in O(1) — total O(m×n). The dp table is O(m×n) space, but since dp[i][j] only depends on the row above and the cell to the left, we can use a single 1D array of n elements, overwriting left-to-right — O(n) space. The closed-form answer is also C(m+n−2, m−1) (combinatorics), computable in O(min(m,n)) time and O(1) space.',
    },
    codes: {
      javascript: `function uniquePaths(m, n) {
  const dp = Array.from({length: m}, () => Array(n).fill(1));

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i-1][j] + dp[i][j-1];
    }
  }

  return dp[m-1][n-1];
}`,
      typescript: `function uniquePaths(m: number, n: number): number {
  const dp: number[][] = Array.from({length: m}, () => Array(n).fill(1));

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i-1][j] + dp[i][j-1];
    }
  }

  return dp[m-1][n-1];
}`,
      python: `def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]

    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]

    return dp[m-1][n-1]`,
      java: `public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int[] row : dp) Arrays.fill(row, 1);

    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
        }
    }

    return dp[m-1][n-1];
}`,
      c: `int uniquePaths(int m, int n) {
    int dp[m][n];
    for (int i=0;i<m;i++)
        for (int j=0;j<n;j++) dp[i][j]=1;

    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
        }
    }

    return dp[m-1][n-1];
}`,
    },
    lineMap: {
      typescript: { 1: 1, 2: 2, 5: 5, 9: 10 },
      python:     { 1: 1, 2: 2, 5: 5, 9: 8  },
      java:       { 1: 1, 2: 2, 5: 5, 9: 10 },
      c:          { 1: 1, 2: 2, 5: 6, 9: 11 },
    },
    defaultInput: { m: 4, n: 4 },
    generate: generateUniquePaths,
  },
];
