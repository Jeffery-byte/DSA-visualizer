import type { Algorithm, Frame, ArrayState } from '../../types';

function makeArray(data: (number | string | null)[], highlights: ArrayState['highlights'] = [], pointers: ArrayState['pointers'] = [], id = 'arr', label = 'Array'): ArrayState {
  return { id, label, data, highlights, pointers };
}

// ─── Binary Search ─────────────────────────────────────────────────────────────
function generateBinarySearch(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [1, 3, 5, 7, 9, 11, 13, 15, 17, 19])];
  const target = (input.target as number) ?? 13;
  const frames: Frame[] = [];

  frames.push({ line: 1, description: `Binary Search for target=${target} in sorted array`, arrays: [makeArray([...arr])] });

  let lo = 0, hi = arr.length - 1;
  frames.push({
    line: 2,
    description: `Initialize: lo=${lo}, hi=${hi}`,
    arrays: [makeArray([...arr], [{ index: lo, color: 'left' }, { index: hi, color: 'right' }],
      [{ index: lo, label: 'lo', color: '#22c55e' }, { index: hi, label: 'hi', color: '#ef4444' }])],
  });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    frames.push({
      line: 5,
      description: `mid = ⌊(${lo}+${hi})/2⌋ = ${mid}  →  arr[mid]=${arr[mid]}`,
      arrays: [makeArray([...arr],
        [{ index: lo, color: 'left' }, { index: hi, color: 'right' }, { index: mid, color: 'mid' }],
        [{ index: lo, label: 'lo', color: '#22c55e' }, { index: hi, label: 'hi', color: '#ef4444' }, { index: mid, label: 'mid', color: '#eab308' }])],
    });

    if (arr[mid] === target) {
      frames.push({
        line: 7,
        description: `Found! arr[${mid}]=${arr[mid]} = target=${target}`,
        arrays: [makeArray([...arr], [{ index: mid, color: 'found' }], [{ index: mid, label: '✓', color: '#22c55e' }])],
      });
      return frames;
    } else if (arr[mid] < target) {
      frames.push({
        line: 9,
        description: `arr[mid]=${arr[mid]} < target=${target}, search right half`,
        arrays: [makeArray([...arr],
          [...Array.from({ length: mid + 1 }, (_, i) => ({ index: i, color: 'excluded' as const })),
            { index: lo, color: 'left' }, { index: hi, color: 'right' }],
          [{ index: lo, label: 'lo', color: '#22c55e' }, { index: hi, label: 'hi', color: '#ef4444' }])],
      });
      lo = mid + 1;
    } else {
      frames.push({
        line: 11,
        description: `arr[mid]=${arr[mid]} > target=${target}, search left half`,
        arrays: [makeArray([...arr],
          [...Array.from({ length: arr.length - mid }, (_, i) => ({ index: mid + i, color: 'excluded' as const })),
            { index: lo, color: 'left' }, { index: hi, color: 'right' }],
          [{ index: lo, label: 'lo', color: '#22c55e' }, { index: hi, label: 'hi', color: '#ef4444' }])],
      });
      hi = mid - 1;
    }
  }
  frames.push({ line: 14, description: `Target ${target} not found`, arrays: [makeArray([...arr])] });
  return frames;
}

export const binarySearchAlgorithms: Algorithm[] = [
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    description: 'Divide and conquer on a sorted array: compare target with mid, eliminate the impossible half.',
    complexity: {
      time: 'O(log n)',
      space: 'O(1)',
      reasoning:
        'Each iteration cuts the remaining search space in half. Starting with n elements, after k iterations only n/2^k remain. We stop when n/2^k ≤ 1, so k = log₂n — giving O(log n) iterations. Space is O(1) because we only store lo, hi, and mid; no extra data structure is used. (Recursive versions use O(log n) stack space.)',
    },
    codes: {
      javascript: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (arr[mid] === target) {
      return mid;          // found!
    } else if (arr[mid] < target) {
      lo = mid + 1;        // search right half
    } else {
      hi = mid - 1;        // search left half
    }
  }
  return -1;               // not found
}`,
      typescript: `function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (arr[mid] === target) {
      return mid;          // found!
    } else if (arr[mid] < target) {
      lo = mid + 1;        // search right half
    } else {
      hi = mid - 1;        // search left half
    }
  }
  return -1;               // not found
}`,
      python: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1

    while lo <= hi:
        mid = (lo + hi) // 2

        if arr[mid] == target:
            return mid          # found!
        elif arr[mid] < target:
            lo = mid + 1        # search right half
        else:
            hi = mid - 1        # search left half

    return -1                   # not found`,
      java: `public static int binarySearch(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;

        if (arr[mid] == target) {
            return mid;          // found!
        } else if (arr[mid] < target) {
            lo = mid + 1;        // search right half
        } else {
            hi = mid - 1;        // search left half
        }
    }
    return -1;                   // not found
}`,
      c: `int binarySearch(int arr[], int n, int target) {
    int lo = 0, hi = n - 1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;

        if (arr[mid] == target) {
            return mid;          /* found! */
        } else if (arr[mid] < target) {
            lo = mid + 1;        /* search right half */
        } else {
            hi = mid - 1;        /* search left half */
        }
    }
    return -1;                   /* not found */
}`,
    },
    lineMap: {
      typescript: { 1: 1, 2: 2, 5: 5, 7: 7, 9: 9, 11: 11, 14: 15 },
      python:     { 1: 1, 2: 2, 5: 5, 7: 7, 9: 9, 11: 11, 14: 13 },
      java:       { 1: 1, 2: 2, 5: 5, 7: 7, 9: 9, 11: 11, 14: 14 },
      c:          { 1: 1, 2: 2, 5: 5, 7: 7, 9: 9, 11: 11, 14: 14 },
    },
    defaultInput: { array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], target: 13 },
    generate: generateBinarySearch,
  },
];
