import type { Algorithm, Frame, ArrayState } from '../../types';

function makeArray(data: (number | string | null)[], highlights: ArrayState['highlights'] = [], pointers: ArrayState['pointers'] = [], id = 'arr', label = 'Array'): ArrayState {
  return { id, label, data, highlights, pointers };
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

export const twoPointerAlgorithms: Algorithm[] = [
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
];
