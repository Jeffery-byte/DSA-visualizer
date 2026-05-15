import type { Algorithm, Frame, ArrayState } from '../../types';

function makeArray(data: number[], highlights: ArrayState['highlights'] = [], pointers: ArrayState['pointers'] = []): ArrayState {
  return { id: 'arr', label: 'Array', data, highlights, pointers };
}

// ─── Bubble Sort ───────────────────────────────────────────────────────────────
function generateBubbleSort(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [64, 34, 25, 12, 22, 11, 90])];
  const frames: Frame[] = [];
  const n = arr.length;

  frames.push({ line: 1, description: 'Starting Bubble Sort', arrays: [makeArray([...arr])] });

  for (let i = 0; i < n - 1; i++) {
    frames.push({
      line: 3,
      description: `Outer pass i=${i}: elements after index ${n - 1 - i} are sorted`,
      arrays: [makeArray([...arr], Array.from({ length: i }, (_, k) => ({ index: n - 1 - k, color: 'sorted' as const })))],
    });
    for (let j = 0; j < n - 1 - i; j++) {
      const sortedHighlights = Array.from({ length: i }, (_, k) => ({ index: n - 1 - k, color: 'sorted' as const }));
      frames.push({
        line: 4,
        description: `Comparing arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`,
        arrays: [makeArray([...arr], [...sortedHighlights, { index: j, color: 'comparing' }, { index: j + 1, color: 'comparing' }])],
      });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        frames.push({
          line: 5,
          description: `Swapped! arr[${j}]↔arr[${j + 1}]`,
          arrays: [makeArray([...arr], [...sortedHighlights, { index: j, color: 'swapping' }, { index: j + 1, color: 'swapping' }])],
        });
      }
    }
  }

  frames.push({
    line: 9,
    description: 'Array is fully sorted!',
    arrays: [makeArray([...arr], arr.map((_, i) => ({ index: i, color: 'sorted' as const })))],
  });
  return frames;
}

// ─── Linear Search ─────────────────────────────────────────────────────────────
function generateLinearSearch(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [4, 2, 7, 1, 9, 3, 6, 8])];
  const target = (input.target as number) ?? 9;
  const frames: Frame[] = [];

  frames.push({ line: 1, description: `Searching for target=${target}`, arrays: [makeArray([...arr])] });

  for (let i = 0; i < arr.length; i++) {
    frames.push({
      line: 2,
      description: `Checking index ${i}: arr[${i}]=${arr[i]}`,
      arrays: [makeArray([...arr], [{ index: i, color: 'current' }], [{ index: i, label: 'i', color: '#3b82f6' }])],
    });
    if (arr[i] === target) {
      frames.push({
        line: 3,
        description: `Found! arr[${i}]=${arr[i]} equals target=${target}`,
        arrays: [makeArray([...arr], [{ index: i, color: 'found' }], [{ index: i, label: '✓', color: '#22c55e' }])],
      });
      return frames;
    }
  }

  frames.push({ line: 6, description: `Target ${target} not found in array`, arrays: [makeArray([...arr])] });
  return frames;
}

export const arrayAlgorithms: Algorithm[] = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'arrays',
    description: 'Repeatedly compare and swap adjacent elements until the entire array is sorted.',
    complexity: {
      time: 'O(n²)',
      space: 'O(1)',
      reasoning:
        'Two nested loops each run up to n iterations — the outer loop runs n−1 passes and the inner loop shrinks by 1 each pass, giving n·(n−1)/2 ≈ O(n²) comparisons in the worst case. Even if the array is already sorted (best case O(n) with early-exit), the basic version always does O(n²). Space is O(1) because sorting happens in-place; the only extra variable is a temporary swap holder.',
    },
    codes: {
      javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      typescript: `function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
      java: `public static int[] bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}`,
      c: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j]   = arr[j + 1];
                arr[j+1] = temp;
            }
        }
    }
}`,
    },
    lineMap: {
      typescript: { 1: 1, 3: 3, 4: 4, 5: 5, 9: 10 },
      python:     { 1: 1, 3: 3, 4: 4, 5: 5, 9: 7  },
      java:       { 1: 1, 3: 3, 4: 4, 5: 5, 9: 11 },
      c:          { 1: 1, 3: 2, 4: 3, 5: 4, 9: 9  },
    },
    defaultInput: { array: [64, 34, 25, 12, 22, 11, 90] },
    generate: generateBubbleSort,
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'arrays',
    description: 'Scan each element one by one until the target is found or the array is exhausted.',
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      reasoning:
        'In the worst case the target is at the last position (or absent), so we visit every element once — exactly n comparisons. Best case is O(1) when the target is at index 0. Space is O(1) because we only maintain the loop counter i; no auxiliary data structure is created.',
    },
    codes: {
      javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // found at index i
    }
  }
  return -1; // not found
}`,
      typescript: `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // found at index i
    }
  }
  return -1; // not found
}`,
      python: `def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i   # found at index i
    return -1          # not found`,
      java: `public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i; // found at index i
        }
    }
    return -1; // not found
}`,
      c: `int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i; /* found */
        }
    }
    return -1; /* not found */
}`,
    },
    lineMap: {
      typescript: { 1: 1, 2: 2, 3: 3, 6: 7 },
      python:     { 1: 1, 2: 2, 3: 3, 6: 5 },
      java:       { 1: 1, 2: 2, 3: 3, 6: 7 },
      c:          { 1: 1, 2: 2, 3: 3, 6: 7 },
    },
    defaultInput: { array: [4, 2, 7, 1, 9, 3, 6, 8], target: 9 },
    generate: generateLinearSearch,
  },
];
