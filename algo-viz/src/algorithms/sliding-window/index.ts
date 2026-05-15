import type { Algorithm, Frame, ArrayState } from '../../types';

function makeArray(data: (number | string | null)[], highlights: ArrayState['highlights'] = [], pointers: ArrayState['pointers'] = [], id = 'arr', label = 'Array'): ArrayState {
  return { id, label, data, highlights, pointers };
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

export const slidingWindowAlgorithms: Algorithm[] = [
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
