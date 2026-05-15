/**
 * Heuristic complexity analyzer.
 *
 * Inspects the user's code (as a string) for structural patterns and infers
 * Big-O time and space complexity.  This is intentionally approximate — it
 * covers the most common algorithm patterns taught in DSA courses.
 *
 * Rules (evaluated in priority order):
 *
 * TIME:
 *  1. Explicit recursion calling itself with n/2  → O(log n)
 *  2. Recursion with TWO calls (fib/tree)         → O(2ⁿ)
 *  3. Recursion + a loop inside                   → O(n log n) or O(n·k)
 *  4. Recursion (single call, linear)             → O(n)
 *  5. Three nested loops                          → O(n³)
 *  6. Two nested loops                            → O(n²)
 *  7. Single loop with binary-search pattern      → O(n log n)
 *  8. Single loop                                 → O(n)
 *  9. No loops, no recursion                      → O(1)
 *
 * SPACE:
 *  1. 2-D array allocation (dp[m][n] or similar)  → O(m·n)
 *  2. Recursion with memoization table            → O(n)
 *  3. Recursion                                   → O(n) stack
 *  4. Array/Map allocation proportional to input  → O(n)
 *  5. Only scalar temps                           → O(1)
 */

import type { Complexity } from '../types';

// ─── Simple heuristic helpers ──────────────────────────────────────────────────

function stripStringsAndComments(code: string): string {
  return code
    // single-line comments
    .replace(/\/\/[^\n]*/g, ' ')
    // multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    // string literals
    .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '""');
}

interface Analysis {
  loopDepth: number;
  hasRecursion: boolean;
  hasTwoRecursiveCalls: boolean;
  hasHalvingRecursion: boolean;
  hasNestedBinarySearch: boolean;
  allocates2DArray: boolean;
  allocates1DArray: boolean;
  allocatesMap: boolean;
  hasDP: boolean;
  functionName: string;
}

export function analyzeComplexity(rawCode: string): Complexity {
  const code = stripStringsAndComments(rawCode);

  // Extract the primary function name
  const fnMatch = code.match(/function\s+(\w+)|def\s+(\w+)|(\w+)\s*=\s*(?:function|\()/);
  const functionName = fnMatch?.[1] ?? fnMatch?.[2] ?? fnMatch?.[3] ?? 'the function';

  // ── Loop depth ────────────────────────────────────────────────────────────
  let maxLoopDepth = 0;
  // Approximate nesting depth by counting opening braces after loop keywords
  const lines = code.split('\n');
  let currentDepth = 0;
  let inLoop = false;
  for (const line of lines) {
    const loopMatch = /\b(for|while)\s*\(/.test(line);
    if (loopMatch) {
      currentDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, currentDepth);
      inLoop = true;
    }
    if (inLoop && line.includes('}')) {
      currentDepth = Math.max(0, currentDepth - 1);
      if (currentDepth === 0) inLoop = false;
    }
  }
  // Simpler heuristic: count unique loop-nesting levels from indentation
  const loopLines = lines.filter(l => /\b(for|while)\s*\(/.test(l));
  const indents = loopLines.map(l => (l.match(/^(\s*)/)?.[1].length ?? 0));
  const uniqueIndents = new Set(indents).size;
  maxLoopDepth = Math.max(maxLoopDepth, uniqueIndents);

  // ── Recursion detection ───────────────────────────────────────────────────
  const fnNameInCode = functionName;
  // Does the function call itself?
  const selfCallRe = new RegExp(`\\b${fnNameInCode}\\s*\\(`, 'g');
  const selfCalls = [...code.matchAll(selfCallRe)].length;
  const hasRecursion = selfCalls >= 1;

  // Two recursive calls (Fibonacci-style)
  const hasTwoRecursiveCalls = selfCalls >= 2;

  // Halving recursion: calls self with n/2 or mid
  const hasHalvingRecursion = hasRecursion && (
    /\(\s*\w+\s*\/\s*2/.test(code) ||
    /mid\b/.test(code) ||
    /\w+\s*-\s*1\s*\)/.test(code)
  );

  // Nested binary search inside a loop
  const hasNestedBinarySearch =
    maxLoopDepth >= 1 &&
    /\blo\b|\bhi\b|\blow\b|\bhigh\b|\bmid\b/.test(code) &&
    /\/\s*2/.test(code);

  // ── Space: array allocations ───────────────────────────────────────────────
  // 2D array
  const allocates2DArray =
    /Array\.from\s*\(\s*\{[^}]+\}\s*,\s*\(\)\s*=>\s*Array\s*\(/.test(code) ||
    /\[\s*\]\s*\.\s*fill\s*\(\s*\[\s*\]\s*\)/.test(code) ||
    /new\s+int\s*\[\s*\w+\s*\]\s*\[\s*\w+\s*\]/.test(code) ||  // Java
    /\[\s*\[\s*0\s*\]\s*\*/.test(code) ||                        // Python
    /dp\s*=\s*\[.*for.*for/.test(code);                           // Python 2D

  const allocates1DArray =
    /new\s+Array\s*\(/.test(code) ||
    /\[\s*\]\s*\.fill\s*\(/.test(code) ||
    /Array\.from\s*\(/.test(code) ||
    /=\s*\[\s*\]/.test(code) ||
    /new\s+\w+\s*\[\s*\w+\s*\]/.test(code) ||    // Java
    /=\s*\[\s*0\s*\]\s*\*\s*\w+/.test(code);      // Python

  const allocatesMap =
    /new\s+Map\s*\(/.test(code) ||
    /new\s+HashMap\s*\(/.test(code) ||
    /new\s+HashSet\s*\(/.test(code) ||
    /=\s*\{\s*\}/.test(code) ||
    /defaultdict|Counter|dict\s*\(/.test(code);

  const hasDP = allocates1DArray || allocates2DArray;

  const a: Analysis = {
    loopDepth: maxLoopDepth,
    hasRecursion,
    hasTwoRecursiveCalls,
    hasHalvingRecursion,
    hasNestedBinarySearch,
    allocates2DArray,
    allocates1DArray,
    allocatesMap,
    hasDP,
    functionName,
  };

  return deriveComplexity(a);
}

function deriveComplexity(a: Analysis): Complexity {
  // ── Time complexity ────────────────────────────────────────────────────────
  let time: string;
  let timeReason: string;

  if (a.hasRecursion && a.hasTwoRecursiveCalls && !a.allocates1DArray) {
    time = 'O(2ⁿ)';
    timeReason =
      `${a.functionName} calls itself twice per invocation. Without memoization the call tree is a full binary tree of depth n, producing 2^n nodes. Adding a memo table (DP top-down) collapses this to O(n).`;
  } else if (a.hasRecursion && a.hasHalvingRecursion) {
    time = 'O(log n)';
    timeReason =
      `${a.functionName} recurs on half the input each time (halving pattern detected: n/2 or mid). This gives the recurrence T(n) = T(n/2) + O(1), which solves to O(log n) by the Master Theorem.`;
  } else if (a.hasRecursion && a.loopDepth >= 1) {
    time = 'O(n log n)';
    timeReason =
      `${a.functionName} is recursive and contains a loop. This is typical of divide-and-conquer algorithms (merge sort, quick sort) where each level processes O(n) work over log n levels, giving O(n log n).`;
  } else if (a.hasRecursion) {
    time = 'O(n)';
    timeReason =
      `${a.functionName} recurses once per element (single recursive call, no branching). Each level does O(1) work, and there are n levels → O(n).`;
  } else if (a.loopDepth >= 3) {
    time = 'O(n³)';
    timeReason =
      `Three nested loops were detected. If each iterates up to n times, the total iterations are n × n × n = n³. Common in naive 3-sum or matrix multiplication.`;
  } else if (a.loopDepth >= 2) {
    time = 'O(n²)';
    timeReason =
      `Two nested loops detected, each running up to n times → n² iterations. Common in bubble sort, selection sort, and naive two-pointer / comparison approaches.`;
  } else if (a.hasNestedBinarySearch) {
    time = 'O(n log n)';
    timeReason =
      `A loop over n elements with an inner binary-search pattern (lo/hi/mid halving) → O(n log n). Each outer iteration costs O(log n).`;
  } else if (a.loopDepth === 1) {
    time = 'O(n)';
    timeReason =
      `A single loop iterates over n elements once, performing O(1) work per iteration → O(n) total.`;
  } else {
    time = 'O(1)';
    timeReason =
      `No loops or recursion detected. The algorithm runs in constant time regardless of input size.`;
  }

  // ── Space complexity ───────────────────────────────────────────────────────
  let space: string;
  let spaceReason: string;

  if (a.allocates2DArray) {
    space = 'O(m × n)';
    spaceReason =
      `A 2-D array (DP table or matrix) is allocated. Its size is proportional to the product of the two input dimensions → O(m × n). This can often be compressed to O(min(m,n)) by keeping only the previous row.`;
  } else if (a.hasRecursion && (a.allocates1DArray || a.allocatesMap)) {
    space = 'O(n)';
    spaceReason =
      `The function is recursive (O(n) call stack depth) and also maintains an auxiliary array or map → O(n) total. Memoization tables are the most common example.`;
  } else if (a.hasRecursion) {
    space = 'O(n)';
    spaceReason =
      `Recursive calls are pushed onto the call stack. In the worst case the depth is n (linear recursion), so the implicit stack space is O(n). Tail-recursive implementations can reduce this to O(1).`;
  } else if (a.allocates1DArray || a.allocatesMap) {
    space = 'O(n)';
    spaceReason =
      `An auxiliary array or hash map is allocated whose size scales with the input → O(n) space. This is the classic time–space trade-off: we pay O(n) memory to achieve better time complexity.`;
  } else {
    space = 'O(1)';
    spaceReason =
      `Only a fixed number of scalar variables (pointers, counters, temps) are used. No data structures grow with input size → O(1) in-place space.`;
  }

  return {
    time,
    space,
    reasoning: `**Time ${time}:** ${timeReason}\n\n**Space ${space}:** ${spaceReason}`,
  };
}
