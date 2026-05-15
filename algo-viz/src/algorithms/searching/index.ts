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

// ─── Two Pointers: Two Sum Sorted ──────────────────────────────────────────────
function generateTwoSumSorted(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [1, 2, 3, 4, 6, 8, 9, 14, 15])];
  const target = (input.target as number) ?? 17;
  const frames: Frame[] = [];

  frames.push({ line: 1, description: `Two Sum in sorted array, target=${target}`, arrays: [makeArray([...arr])] });
  let left = 0, right = arr.length - 1;
  frames.push({
    line: 2,
    description: `Initialize: left=${left}, right=${right}`,
    arrays: [makeArray([...arr], [{ index: left, color: 'left' }, { index: right, color: 'right' }],
      [{ index: left, label: 'L', color: '#22c55e' }, { index: right, label: 'R', color: '#ef4444' }])],
  });

  while (left < right) {
    const sum = arr[left] + arr[right];
    frames.push({
      line: 4,
      description: `arr[${left}]+arr[${right}] = ${arr[left]}+${arr[right]} = ${sum} (target=${target})`,
      arrays: [makeArray([...arr], [{ index: left, color: 'comparing' }, { index: right, color: 'comparing' }],
        [{ index: left, label: 'L', color: '#22c55e' }, { index: right, label: 'R', color: '#ef4444' }])],
      variables: { left, right, sum, target },
    });

    if (sum === target) {
      frames.push({
        line: 7,
        description: `Found! [${left}, ${right}] → ${arr[left]}+${arr[right]}=${target}`,
        arrays: [makeArray([...arr], [{ index: left, color: 'found' }, { index: right, color: 'found' }])],
      });
      return frames;
    } else if (sum < target) {
      frames.push({
        line: 9,
        description: `sum=${sum} < target=${target}, move left pointer right`,
        arrays: [makeArray([...arr], [{ index: left, color: 'left' }, { index: right, color: 'right' }],
          [{ index: left, label: 'L→', color: '#22c55e' }, { index: right, label: 'R', color: '#ef4444' }])],
      });
      left++;
    } else {
      frames.push({
        line: 11,
        description: `sum=${sum} > target=${target}, move right pointer left`,
        arrays: [makeArray([...arr], [{ index: left, color: 'left' }, { index: right, color: 'right' }],
          [{ index: left, label: 'L', color: '#22c55e' }, { index: right, label: '←R', color: '#ef4444' }])],
      });
      right--;
    }
  }
  frames.push({ line: 14, description: 'No pair found', arrays: [makeArray([...arr])] });
  return frames;
}

// ─── Sliding Window: Max Subarray Sum ─────────────────────────────────────────
function generateSlidingWindow(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [2, 1, 5, 1, 3, 2, 7, 4])];
  const k = (input.k as number) ?? 3;
  const frames: Frame[] = [];

  const windowHl = (start: number, end: number, extras: ArrayState['highlights'] = []): ArrayState['highlights'] =>
    [...Array.from({ length: end - start + 1 }, (_, i) => ({ index: start + i, color: 'current' as const })), ...extras];

  frames.push({ line: 1, description: `Sliding Window: find max sum subarray of size k=${k}`, arrays: [makeArray([...arr])] });

  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
    frames.push({ line: 6, description: `Adding arr[${i}]=${arr[i]} to window → sum=${windowSum}`, arrays: [makeArray([...arr], windowHl(0, i))], variables: { windowSum } });
  }

  let maxSum = windowSum;
  frames.push({ line: 8, description: `Initial window [0..${k-1}]: sum=${windowSum} = maxSum`, arrays: [makeArray([...arr], windowHl(0, k - 1))], variables: { windowSum, maxSum } });

  for (let i = k; i < arr.length; i++) {
    const removed = arr[i - k];
    windowSum += arr[i] - removed;
    const isNew = windowSum > maxSum;
    if (isNew) maxSum = windowSum;

    frames.push({
      line: 12,
      description: `Slide: remove arr[${i-k}]=${removed}, add arr[${i}]=${arr[i]} → sum=${windowSum}${isNew ? ' (new max!)' : ''}`,
      arrays: [makeArray([...arr],
        [...windowHl(i - k + 1, i), { index: i - k, color: 'excluded' }],
        [{ index: i - k + 1, label: '←', color: '#22c55e' }, { index: i, label: '→', color: '#ef4444' }])],
      variables: { windowSum, maxSum },
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
  {
    id: 'two-sum-sorted',
    name: 'Two Sum (Sorted Array)',
    category: 'two-pointers',
    description: 'Two pointers: one from each end converge inward — increase sum by moving left right, decrease by moving right left.',
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      reasoning:
        'The two pointers start at opposite ends and each step moves at least one pointer inward, so they collectively travel at most n positions total — giving O(n). Unlike a brute-force O(n²) double loop or the O(n) HashMap approach, here we exploit the sorted order to guide which pointer to move. Space is O(1) since we only store two index variables.',
    },
    codes: {
      javascript: `function twoSumSorted(arr, target) {
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
}`,
      typescript: `function twoSumSorted(arr: number[], target: number): number[] {
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
}`,
      python: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1

    while left < right:
        s = arr[left] + arr[right]

        if s == target:
            return [left, right]   # found pair
        elif s < target:
            left += 1              # need larger sum
        else:
            right -= 1             # need smaller sum

    return []                      # no pair found`,
      java: `public static int[] twoSumSorted(int[] arr, int target) {
    int left = 0, right = arr.length - 1;

    while (left < right) {
        int sum = arr[left] + arr[right];

        if (sum == target) {
            return new int[]{left, right};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return new int[]{};
}`,
      c: `int* twoSumSorted(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    static int result[2];

    while (left < right) {
        int sum = arr[left] + arr[right];

        if (sum == target) {
            result[0] = left; result[1] = right;
            return result;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return NULL;
}`,
    },
    lineMap: {
      typescript: { 1: 1, 2: 2, 4: 4, 7: 7, 9: 9, 11: 11, 14: 15 },
      python:     { 1: 1, 2: 2, 4: 4, 7: 7, 9: 9, 11: 11, 14: 13 },
      java:       { 1: 1, 2: 2, 4: 4, 7: 7, 9: 9, 11: 11, 14: 14 },
      c:          { 1: 1, 2: 2, 4: 5, 7: 8, 9: 11, 11: 13, 14: 16 },
    },
    defaultInput: { array: [1, 2, 3, 4, 6, 8, 9, 14, 15], target: 17 },
    generate: generateTwoSumSorted,
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window (Max Sum)',
    category: 'sliding-window',
    description: 'Maintain a fixed-size window: add the new right element and remove the old left element each slide.',
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      reasoning:
        'The array is traversed exactly once — the initial window build takes k steps and then the slide loop takes n−k steps, totalling n steps. The key insight is that instead of recomputing the sum of k elements from scratch each time (O(n·k)), we add one and subtract one (O(1) per slide). Space is O(1): only windowSum and maxSum are stored.',
    },
    codes: {
      javascript: `function maxSubarraySum(arr, k) {
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
}`,
      typescript: `function maxSubarraySum(arr: number[], k: number): number {
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
}`,
      python: `def max_subarray_sum(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum

    # Slide the window
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        if window_sum > max_sum:
            max_sum = window_sum

    return max_sum`,
      java: `public static int maxSubarraySum(int[] arr, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    int maxSum = windowSum;

    for (int i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k];
        if (windowSum > maxSum) {
            maxSum = windowSum;
        }
    }
    return maxSum;
}`,
      c: `int maxSubarraySum(int arr[], int n, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++)
        windowSum += arr[i];
    int maxSum = windowSum;

    for (int i = k; i < n; i++) {
        windowSum += arr[i] - arr[i - k];
        if (windowSum > maxSum)
            maxSum = windowSum;
    }
    return maxSum;
}`,
    },
    lineMap: {
      typescript: { 1: 1, 6: 6, 8: 9, 12: 12, 17: 18 },
      python:     { 1: 1, 6: 5, 8: 3, 12: 6, 17: 10 },
      java:       { 1: 1, 6: 3, 8: 6, 12: 8, 17: 14 },
      c:          { 1: 1, 6: 3, 8: 5, 12: 7, 17: 12 },
    },
    defaultInput: { array: [2, 1, 5, 1, 3, 2, 7, 4], k: 3 },
    generate: generateSlidingWindow,
  },
];
