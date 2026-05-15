import type { Algorithm, Frame, CallStackFrame, ArrayState } from '../../types';

// ─── Fibonacci ────────────────────────────────────────────────────────────────
function generateFib(input: Record<string, unknown>): Frame[] {
  const n = Math.min((input.n as number) ?? 5, 7);
  const frames: Frame[] = [];
  let frameIdCounter = 0;
  const stack: CallStackFrame[] = [];

  function fib(n: number, depth: number): number {
    const id = `fib-${frameIdCounter++}`;
    const frame: CallStackFrame = { id, funcName: `fib(${n})`, args: { n }, isActive: true, depth };
    stack.push(frame);
    frames.push({ line: 1, description: `Call fib(${n}) — depth ${depth}`, callStack: stack.map(f => ({ ...f, isActive: f.id === id })) });

    if (n <= 1) {
      frame.returnValue = n;
      frame.isActive = false;
      frames.push({ line: 2, description: `Base case: fib(${n}) = ${n}`, callStack: stack.map(f => ({ ...f, highlight: f.id === id ? 'found' as const : undefined })) });
      stack.pop();
      return n;
    }

    frames.push({ line: 4, description: `fib(${n}): recurse left → fib(${n - 1})`, callStack: stack.map(f => ({ ...f, isActive: f.id === id })) });
    const left = fib(n - 1, depth + 1);
    frames.push({ line: 5, description: `fib(${n}): recurse right → fib(${n - 2})`, callStack: stack.map(f => ({ ...f, isActive: f.id === id })) });
    const right = fib(n - 2, depth + 1);

    const result = left + right;
    frame.returnValue = result;
    frame.isActive = false;
    frames.push({ line: 7, description: `fib(${n}) = ${left} + ${right} = ${result}`, callStack: stack.map(f => ({ ...f, highlight: f.id === id ? 'result' as const : undefined })) });
    stack.pop();
    return result;
  }

  const result = fib(n, 0);
  frames.push({ line: 7, description: `Done! fib(${n}) = ${result}`, callStack: [] });
  return frames;
}

// ─── Subsets (Backtracking) ────────────────────────────────────────────────────
function generateSubsets(input: Record<string, unknown>): Frame[] {
  const nums: number[] = [...((input.array as number[]) ?? [1, 2, 3])];
  const frames: Frame[] = [];
  const result: number[][] = [];
  const current: number[] = [];

  const makeArrayState = (): ArrayState[] => [
    { id: 'nums', label: 'nums', data: [...nums], highlights: [] },
    { id: 'current', label: 'current[]', data: [...current], highlights: current.map((_, i) => ({ index: i, color: 'visiting' as const })) },
  ];

  frames.push({ line: 1, description: `Generate all subsets of [${nums}]`, arrays: makeArrayState() });

  function backtrack(start: number, depth: number): void {
    result.push([...current]);
    frames.push({
      line: 5,
      description: `Add subset [${current.join(', ')}] to result (${result.length} so far)`,
      arrays: makeArrayState(),
      callStack: [{ id: `bt-${depth}`, funcName: `backtrack(start=${start})`, args: { start, current: [...current] }, isActive: true, depth }],
    });

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      frames.push({
        line: 8,
        description: `Choose nums[${i}]=${nums[i]} → current=[${current.join(', ')}]`,
        arrays: makeArrayState(),
        callStack: [{ id: `bt-${depth}`, funcName: `backtrack(start=${start})`, args: { start, i }, isActive: true, depth }],
      });
      backtrack(i + 1, depth + 1);
      current.pop();
      frames.push({
        line: 10,
        description: `Backtrack: remove ${nums[i]} → current=[${current.join(', ')}]`,
        arrays: makeArrayState(),
        callStack: [{ id: `bt-${depth}`, funcName: `backtrack(start=${start})`, args: { start }, isActive: true, depth }],
      });
    }
  }

  backtrack(0, 0);
  frames.push({ line: 14, description: `Done! All ${result.length} subsets generated`, arrays: makeArrayState() });
  return frames;
}

// ─── Permutations ──────────────────────────────────────────────────────────────
function generatePermutations(input: Record<string, unknown>): Frame[] {
  const nums: number[] = [...((input.array as number[]) ?? [1, 2, 3])];
  const frames: Frame[] = [];
  const result: number[][] = [];
  const used: boolean[] = Array(nums.length).fill(false);
  const current: number[] = [];

  const makeArrayStates = (): ArrayState[] => [
    { id: 'nums', label: 'nums', data: [...nums], highlights: used.map((u, i) => u ? { index: i, color: 'current' as const } : null).filter(Boolean) as ArrayState['highlights'] },
    { id: 'current', label: 'current[]', data: [...current], highlights: current.map((_, i) => ({ index: i, color: 'visiting' as const })) },
  ];

  frames.push({ line: 1, description: `Generate all permutations of [${nums}]`, arrays: makeArrayStates() });

  function backtrack(depth: number): void {
    if (current.length === nums.length) {
      result.push([...current]);
      frames.push({
        line: 6,
        description: `Found permutation! [${current.join(', ')}] (${result.length} total)`,
        arrays: makeArrayStates(),
        callStack: [{ id: `perm-${depth}`, funcName: `backtrack([${current}])`, args: { current: [...current] }, isActive: true, depth, highlight: 'found' }],
      });
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      frames.push({
        line: 13,
        description: `Choose nums[${i}]=${nums[i]} → [${current.join(', ')}]`,
        arrays: makeArrayStates(),
        callStack: [{ id: `perm-${depth}`, funcName: `backtrack([${current}])`, args: { i }, isActive: true, depth }],
      });
      backtrack(depth + 1);
      current.pop();
      used[i] = false;
      frames.push({
        line: 16,
        description: `Backtrack: unuse nums[${i}]=${nums[i]}`,
        arrays: makeArrayStates(),
        callStack: [{ id: `perm-${depth}`, funcName: `backtrack([${current}])`, args: { i }, isActive: true, depth }],
      });
    }
  }

  backtrack(0);
  frames.push({ line: 20, description: `Done! ${result.length} permutations generated`, arrays: makeArrayStates() });
  return frames;
}

export const recursionAlgorithms: Algorithm[] = [
  {
    id: 'fibonacci',
    name: 'Fibonacci (Recursion)',
    category: 'recursion',
    description: 'Classic recursive Fibonacci — watch the call tree branch and resolve from base cases upward.',
    complexity: {
      time: 'O(2ⁿ)',
      space: 'O(n)',
      reasoning:
        'Each call to fib(n) spawns two sub-calls: fib(n-1) and fib(n-2). The call tree is a binary tree of depth n, with up to 2^n nodes total — hence O(2^n) time. Many sub-problems are recomputed (fib(2) alone is called O(2^(n-2)) times). Memoization (top-down DP) or tabulation (bottom-up DP) reduces this to O(n) time. The call stack depth is at most n, so space is O(n).',
    },
    codes: {
      javascript: `function fib(n) {
  if (n <= 1) return n;        // base case

  const left  = fib(n - 1);   // recurse left
  const right = fib(n - 2);   // recurse right

  return left + right;         // combine
}`,
      typescript: `function fib(n: number): number {
  if (n <= 1) return n;        // base case

  const left  = fib(n - 1);   // recurse left
  const right = fib(n - 2);   // recurse right

  return left + right;         // combine
}`,
      python: `def fib(n):
    if n <= 1:
        return n          # base case

    left  = fib(n - 1)   # recurse left
    right = fib(n - 2)   # recurse right

    return left + right   # combine`,
      java: `public static int fib(int n) {
    if (n <= 1) return n;       // base case

    int left  = fib(n - 1);    // recurse left
    int right = fib(n - 2);    // recurse right

    return left + right;        // combine
}`,
      c: `int fib(int n) {
    if (n <= 1) return n;       /* base case */

    int left  = fib(n - 1);    /* recurse left  */
    int right = fib(n - 2);    /* recurse right */

    return left + right;        /* combine */
}`,
    },
    lineMap: {
      typescript: { 1: 1, 2: 2, 4: 4, 5: 5, 7: 7 },
      python:     { 1: 1, 2: 2, 4: 5, 5: 6, 7: 8 },
      java:       { 1: 1, 2: 2, 4: 4, 5: 5, 7: 7 },
      c:          { 1: 1, 2: 2, 4: 4, 5: 5, 7: 7 },
    },
    defaultInput: { n: 5 },
    generate: generateFib,
  },
  {
    id: 'subsets',
    name: 'Subsets (Backtracking)',
    category: 'backtracking',
    description: 'Choose/un-choose each element: record the current subset, then try adding each remaining element.',
    complexity: {
      time: 'O(n · 2ⁿ)',
      space: 'O(n)',
      reasoning:
        'There are 2^n possible subsets (each element is either included or not). Generating and copying each subset costs O(n) per subset on average. Total time: O(n · 2^n). The recursion depth is at most n (one level per element), and the `current` array holds at most n elements, so auxiliary stack space is O(n). The output itself is O(n · 2^n) but that\'s considered output space.',
    },
    codes: {
      javascript: `function subsets(nums) {
  const result = [];
  const current = [];

  function backtrack(start) {
    result.push([...current]);  // add current subset

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);    // choose
      backtrack(i + 1);         // explore
      current.pop();            // un-choose (backtrack)
    }
  }

  backtrack(0);
  return result;
}`,
      typescript: `function subsets(nums: number[]): number[][] {
  const result: number[][] = [];
  const current: number[] = [];

  function backtrack(start: number): void {
    result.push([...current]);  // add current subset

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);    // choose
      backtrack(i + 1);         // explore
      current.pop();            // un-choose (backtrack)
    }
  }

  backtrack(0);
  return result;
}`,
      python: `def subsets(nums):
    result, current = [], []

    def backtrack(start):
        result.append(list(current))  # add current subset

        for i in range(start, len(nums)):
            current.append(nums[i])   # choose
            backtrack(i + 1)          # explore
            current.pop()             # un-choose (backtrack)

    backtrack(0)
    return result`,
      java: `public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int start,
        List<Integer> current, List<List<Integer>> result) {
    result.add(new ArrayList<>(current)); // add current subset

    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);             // choose
        backtrack(nums, i + 1, current, result); // explore
        current.remove(current.size()-1); // un-choose (backtrack)
    }
}`,
      c: `void backtrack(int* nums, int n, int start,
               int* current, int clen,
               int result[][10], int* rlen) {
    for (int i=0;i<clen;i++) result[*rlen][i]=current[i];
    (*rlen)++;

    for (int i = start; i < n; i++) {
        current[clen] = nums[i];    /* choose */
        backtrack(nums, n, i+1, current, clen+1, result, rlen);
        /* un-choose: clen unchanged on return = backtrack */
    }
}`,
    },
    lineMap: {
      typescript: { 1: 1, 5: 5, 8: 8, 10: 11, 14: 15 },
      python:     { 1: 1, 5: 4, 8: 7, 10: 9, 14: 11 },
      java:       { 1: 1, 5: 8, 8: 11, 10: 13, 14: 3 },
      c:          { 1: 1, 5: 4, 8: 7, 10: 9, 14: 10 },
    },
    defaultInput: { array: [1, 2, 3] },
    generate: generateSubsets,
  },
  {
    id: 'permutations',
    name: 'Permutations (Backtracking)',
    category: 'backtracking',
    description: 'Mark each element as used when chosen; when the current array is full, record the permutation.',
    complexity: {
      time: 'O(n · n!)',
      space: 'O(n)',
      reasoning:
        'There are n! permutations. Copying each permutation into the result costs O(n), giving O(n · n!) total time. The recursion tree has n! leaves and n levels deep — at each level we iterate over n candidates. The `used` array and `current` array both hold n elements, and the call stack is n deep: O(n) auxiliary space. Output space is O(n · n!).',
    },
    codes: {
      javascript: `function permutations(nums) {
  const result = [];
  const used = new Array(nums.length).fill(false);

  function backtrack(current) {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;

      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}`,
      typescript: `function permutations(nums: number[]): number[][] {
  const result: number[][] = [];
  const used = new Array(nums.length).fill(false);

  function backtrack(current: number[]): void {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;

      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}`,
      python: `def permutations(nums):
    result = []
    used   = [False] * len(nums)

    def backtrack(current):
        if len(current) == len(nums):
            result.append(list(current))
            return

        for i, num in enumerate(nums):
            if used[i]: continue

            used[i] = True
            current.append(num)
            backtrack(current)
            current.pop()
            used[i] = False

    backtrack([])
    return result`,
      java: `public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    boolean[] used = new boolean[nums.length];
    backtrack(nums, used, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, boolean[] used,
        List<Integer> current, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        current.add(nums[i]);
        backtrack(nums, used, current, result);
        current.remove(current.size()-1);
        used[i] = false;
    }
}`,
      c: `void backtrack(int* nums, int n, int* used,
               int* current, int clen,
               int result[][10], int* rlen) {
    if (clen == n) {
        for (int i=0;i<n;i++) result[*rlen][i]=current[i];
        (*rlen)++; return;
    }
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;
        used[i] = 1;
        current[clen] = nums[i];
        backtrack(nums, n, used, current, clen+1, result, rlen);
        used[i] = 0;
    }
}`,
    },
    lineMap: {
      typescript: { 1: 1, 6: 6, 13: 13, 16: 16, 20: 21 },
      python:     { 1: 1, 6: 5, 13: 9, 16: 13, 20: 17 },
      java:       { 1: 1, 6: 10, 13: 14, 16: 17, 20: 4 },
      c:          { 1: 1, 6: 4, 13: 8, 16: 11, 20: 13 },
    },
    defaultInput: { array: [1, 2, 3] },
    generate: generatePermutations,
  },
];
