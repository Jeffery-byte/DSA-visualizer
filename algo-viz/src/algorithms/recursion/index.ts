import type { Algorithm, Frame, CallStackFrame, ArrayState } from '../../types';

let frameIdCounter = 0;

// ─── Fibonacci with Call Tree ──────────────────────────────────────────────────
const fibCode = `function fib(n) {
  if (n <= 1) return n;        // base case

  const left  = fib(n - 1);   // recurse left
  const right = fib(n - 2);   // recurse right

  return left + right;         // combine
}`;

function generateFib(input: Record<string, unknown>): Frame[] {
  const n = Math.min((input.n as number) ?? 5, 7);
  const frames: Frame[] = [];
  frameIdCounter = 0;

  const stack: CallStackFrame[] = [];

  function fib(n: number, depth: number): number {
    const id = `fib-${frameIdCounter++}`;
    const frame: CallStackFrame = { id, funcName: `fib(${n})`, args: { n }, isActive: true, depth };

    stack.push(frame);
    frames.push({
      line: 1,
      description: `Call fib(${n}) — depth ${depth}`,
      callStack: stack.map(f => ({ ...f, isActive: f.id === id })),
    });

    if (n <= 1) {
      frame.returnValue = n;
      frame.isActive = false;
      frames.push({
        line: 2,
        description: `Base case: fib(${n}) = ${n}`,
        callStack: stack.map(f => ({ ...f, isActive: f.id === id, highlight: f.id === id ? 'found' : undefined })),
      });
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
    frames.push({
      line: 7,
      description: `fib(${n}) = fib(${n-1}) + fib(${n-2}) = ${left} + ${right} = ${result}`,
      callStack: stack.map(f => ({ ...f, isActive: f.id === id, highlight: f.id === id ? 'result' : undefined })),
    });

    stack.pop();
    return result;
  }

  const result = fib(n, 0);
  frames.push({ line: 7, description: `Done! fib(${n}) = ${result}`, callStack: [] });
  return frames;
}

// ─── Subsets (Backtracking) ────────────────────────────────────────────────────
const subsetsCode = `function subsets(nums) {
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
}`;

function generateSubsets(input: Record<string, unknown>): Frame[] {
  const nums: number[] = [...((input.array as number[]) ?? [1, 2, 3])];
  const frames: Frame[] = [];
  const result: number[][] = [];
  const current: number[] = [];

  const makeArrayState = (): ArrayState[] => [
    { id: 'nums', label: 'nums', data: [...nums], highlights: current.map((_, i) => ({ index: nums.indexOf(current[i]), color: 'current' as const })) },
    { id: 'current', label: 'current[]', data: [...current], highlights: current.map((_, i) => ({ index: i, color: 'visiting' as const })) },
  ];

  frames.push({ line: 1, description: `Generate all subsets of [${nums}]`, arrays: makeArrayState() });

  function backtrack(start: number, depth: number): void {
    result.push([...current]);

    frames.push({
      line: 5,
      description: `Add subset [${current.join(', ')}] to result (${result.length} subsets so far)`,
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
const permutationsCode = `function permutations(nums) {
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
}`;

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
    description: 'Classic recursive Fibonacci — see the call tree unfold.',
    code: fibCode,
    defaultInput: { n: 5 },
    generate: generateFib,
  },
  {
    id: 'subsets',
    name: 'Subsets (Backtracking)',
    category: 'backtracking',
    description: 'Generate all subsets by choosing/un-choosing each element.',
    code: subsetsCode,
    defaultInput: { array: [1, 2, 3] },
    generate: generateSubsets,
  },
  {
    id: 'permutations',
    name: 'Permutations (Backtracking)',
    category: 'backtracking',
    description: 'Generate all permutations by marking elements as used/unused.',
    code: permutationsCode,
    defaultInput: { array: [1, 2, 3] },
    generate: generatePermutations,
  },
];
