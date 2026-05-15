import type { Algorithm, Frame, ArrayState } from '../../types';

function makeArray(data: (number | string | null)[], highlights: ArrayState['highlights'] = [], pointers: ArrayState['pointers'] = [], id = 'arr', label = 'Array'): ArrayState {
  return { id, label, data, highlights, pointers };
}

// ─── Binary Search ─────────────────────────────────────────────────────────────
const binarySearchCode = `function binarySearch(arr, target) {
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
}`;

function generateBinarySearch(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [1, 3, 5, 7, 9, 11, 13, 15, 17, 19])];
  const target = (input.target as number) ?? 13;
  const frames: Frame[] = [];

  frames.push({ line: 1, description: `Binary Search for target=${target} in sorted array`, arrays: [makeArray([...arr])] });

  let lo = 0;
  let hi = arr.length - 1;

  frames.push({
    line: 2,
    description: `Initialize: lo=${lo}, hi=${hi}`,
    arrays: [makeArray([...arr], [{ index: lo, color: 'left' }, { index: hi, color: 'right' }], [{ index: lo, label: 'lo', color: '#22c55e' }, { index: hi, label: 'hi', color: '#ef4444' }])],
  });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    frames.push({
      line: 4,
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
          [...Array.from({ length: mid + 1 }, (_, i) => ({ index: i, color: 'excluded' as const })), { index: lo, color: 'left' }, { index: hi, color: 'right' }, { index: mid, color: 'mid' }],
          [{ index: lo, label: 'lo', color: '#22c55e' }, { index: hi, label: 'hi', color: '#ef4444' }])],
      });
      lo = mid + 1;
    } else {
      frames.push({
        line: 11,
        description: `arr[mid]=${arr[mid]} > target=${target}, search left half`,
        arrays: [makeArray([...arr],
          [...Array.from({ length: arr.length - mid }, (_, i) => ({ index: mid + i, color: 'excluded' as const })), { index: lo, color: 'left' }, { index: hi, color: 'right' }, { index: mid, color: 'mid' }],
          [{ index: lo, label: 'lo', color: '#22c55e' }, { index: hi, label: 'hi', color: '#ef4444' }])],
      });
      hi = mid - 1;
    }
  }

  frames.push({ line: 14, description: `Target ${target} not found`, arrays: [makeArray([...arr])] });
  return frames;
}

// ─── Two Pointers: Two Sum Sorted ──────────────────────────────────────────────
const twoSumSortedCode = `function twoSumSorted(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];

    if (sum === target) {
      return [left, right];   // found pair
    } else if (sum < target) {
      left++;                  // need larger sum
    } else {
      right--;                 // need smaller sum
    }
  }
  return [];                   // no pair found
}`;

function generateTwoSumSorted(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [1, 2, 3, 4, 6, 8, 9, 14, 15])];
  const target = (input.target as number) ?? 17;
  const frames: Frame[] = [];

  frames.push({ line: 1, description: `Two Sum in sorted array, target=${target}`, arrays: [makeArray([...arr])] });

  let left = 0;
  let right = arr.length - 1;

  frames.push({
    line: 2,
    description: `Initialize: left=${left}, right=${right}`,
    arrays: [makeArray([...arr], [{ index: left, color: 'left' }, { index: right, color: 'right' }], [{ index: left, label: 'L', color: '#22c55e' }, { index: right, label: 'R', color: '#ef4444' }])],
  });

  while (left < right) {
    const sum = arr[left] + arr[right];

    frames.push({
      line: 4,
      description: `arr[${left}]+arr[${right}] = ${arr[left]}+${arr[right]} = ${sum} (target=${target})`,
      arrays: [makeArray([...arr], [{ index: left, color: 'comparing' }, { index: right, color: 'comparing' }], [{ index: left, label: 'L', color: '#22c55e' }, { index: right, label: 'R', color: '#ef4444' }])],
      variables: { left, right, sum, target },
    });

    if (sum === target) {
      frames.push({
        line: 7,
        description: `Found! [${left}, ${right}] → ${arr[left]}+${arr[right]}=${target}`,
        arrays: [makeArray([...arr], [{ index: left, color: 'found' }, { index: right, color: 'found' }], [{ index: left, label: 'L', color: '#22c55e' }, { index: right, label: 'R', color: '#ef4444' }])],
      });
      return frames;
    } else if (sum < target) {
      frames.push({
        line: 9,
        description: `sum=${sum} < target=${target}, move left pointer right`,
        arrays: [makeArray([...arr], [{ index: left, color: 'left' }, { index: right, color: 'right' }], [{ index: left, label: 'L→', color: '#22c55e' }, { index: right, label: 'R', color: '#ef4444' }])],
      });
      left++;
    } else {
      frames.push({
        line: 11,
        description: `sum=${sum} > target=${target}, move right pointer left`,
        arrays: [makeArray([...arr], [{ index: left, color: 'left' }, { index: right, color: 'right' }], [{ index: left, label: 'L', color: '#22c55e' }, { index: right, label: '←R', color: '#ef4444' }])],
      });
      right--;
    }
  }

  frames.push({ line: 14, description: 'No pair found', arrays: [makeArray([...arr])] });
  return frames;
}

// ─── Sliding Window: Max Subarray Sum ─────────────────────────────────────────
const slidingWindowCode = `function maxSubarraySum(arr, k) {
  let windowSum = 0;
  let maxSum = 0;

  // Build initial window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;

  // Slide the window
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    if (windowSum > maxSum) {
      maxSum = windowSum;
    }
  }
  return maxSum;
}`;

function generateSlidingWindow(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [2, 1, 5, 1, 3, 2, 7, 4])];
  const k = (input.k as number) ?? 3;
  const frames: Frame[] = [];

  const windowHighlights = (start: number, end: number, extraHighlights: ArrayState['highlights'] = []): ArrayState['highlights'] =>
    [...Array.from({ length: end - start + 1 }, (_, i) => ({ index: start + i, color: 'current' as const })), ...extraHighlights];

  frames.push({ line: 1, description: `Sliding Window: find max sum subarray of size k=${k}`, arrays: [makeArray([...arr])] });

  let windowSum = 0;
  frames.push({ line: 5, description: `Build initial window of size k=${k}`, arrays: [makeArray([...arr])] });

  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
    frames.push({
      line: 6,
      description: `Adding arr[${i}]=${arr[i]} to window → sum=${windowSum}`,
      arrays: [makeArray([...arr], windowHighlights(0, i))],
      variables: { windowSum, i },
    });
  }

  let maxSum = windowSum;
  frames.push({
    line: 8,
    description: `Initial window [0..${k - 1}]: sum=${windowSum} = maxSum`,
    arrays: [makeArray([...arr], windowHighlights(0, k - 1))],
    variables: { windowSum, maxSum },
  });

  for (let i = k; i < arr.length; i++) {
    const removed = arr[i - k];
    windowSum += arr[i] - removed;
    const isNew = windowSum > maxSum;
    if (isNew) maxSum = windowSum;

    frames.push({
      line: 12,
      description: `Slide: remove arr[${i - k}]=${removed}, add arr[${i}]=${arr[i]} → sum=${windowSum}${isNew ? ' (new max!)' : ''}`,
      arrays: [makeArray([...arr],
        [...windowHighlights(i - k + 1, i), { index: i - k, color: 'excluded' }],
        [{ index: i - k + 1, label: '←', color: '#22c55e' }, { index: i, label: '→', color: '#ef4444' }])],
      variables: { windowSum, maxSum, i },
    });
  }

  frames.push({ line: 17, description: `Maximum subarray sum of size ${k} = ${maxSum}`, arrays: [makeArray([...arr])] });
  return frames;
}

export const searchingAlgorithms: Algorithm[] = [
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    description: 'Divide and conquer: compare target with mid, eliminate half each step.',
    code: binarySearchCode,
    defaultInput: { array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], target: 13 },
    generate: generateBinarySearch,
  },
  {
    id: 'two-sum-sorted',
    name: 'Two Sum (Sorted)',
    category: 'two-pointers',
    description: 'Two pointers: one from each end, converge toward the target sum.',
    code: twoSumSortedCode,
    defaultInput: { array: [1, 2, 3, 4, 6, 8, 9, 14, 15], target: 17 },
    generate: generateTwoSumSorted,
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window (Max Sum)',
    category: 'sliding-window',
    description: 'Slide a fixed-size window across the array to find max subarray sum.',
    code: slidingWindowCode,
    defaultInput: { array: [2, 1, 5, 1, 3, 2, 7, 4], k: 3 },
    generate: generateSlidingWindow,
  },
];
