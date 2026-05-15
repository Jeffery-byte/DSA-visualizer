import type { Algorithm, Frame, ArrayState } from '../../types';

function makeArray(data: number[], highlights: ArrayState['highlights'] = [], pointers: ArrayState['pointers'] = []): ArrayState {
  return { id: 'arr', label: 'Array', data, highlights, pointers };
}

// ─── Bubble Sort ───────────────────────────────────────────────────────────────
const bubbleSortCode = `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`;

function generateBubbleSort(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [64, 34, 25, 12, 22, 11, 90])];
  const frames: Frame[] = [];
  const n = arr.length;

  frames.push({ line: 1, description: 'Starting Bubble Sort', arrays: [makeArray([...arr])] });

  for (let i = 0; i < n - 1; i++) {
    frames.push({
      line: 2,
      description: `Outer pass i=${i}: elements after index ${n - 1 - i} are sorted`,
      arrays: [makeArray([...arr], Array.from({ length: i }, (_, k) => ({ index: n - 1 - k, color: 'sorted' as const })))],
    });
    for (let j = 0; j < n - 1 - i; j++) {
      const sortedHighlights = Array.from({ length: i }, (_, k) => ({ index: n - 1 - k, color: 'sorted' as const }));
      frames.push({
        line: 3,
        description: `Comparing arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`,
        arrays: [makeArray([...arr], [...sortedHighlights, { index: j, color: 'comparing' }, { index: j + 1, color: 'comparing' }])],
      });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        frames.push({
          line: 4,
          description: `Swapped arr[${j}] and arr[${j + 1}]`,
          arrays: [makeArray([...arr], [...sortedHighlights, { index: j, color: 'swapping' }, { index: j + 1, color: 'swapping' }])],
        });
      }
    }
  }

  frames.push({
    line: 6,
    description: 'Array is fully sorted!',
    arrays: [makeArray([...arr], arr.map((_, i) => ({ index: i, color: 'sorted' as const })))],
  });
  return frames;
}

// ─── Linear Search ─────────────────────────────────────────────────────────────
const linearSearchCode = `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // found at index i
    }
  }
  return -1; // not found
}`;

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
    description: 'Repeatedly compare and swap adjacent elements until sorted.',
    code: bubbleSortCode,
    defaultInput: { array: [64, 34, 25, 12, 22, 11, 90] },
    generate: generateBubbleSort,
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'arrays',
    description: 'Scan each element one by one until the target is found.',
    code: linearSearchCode,
    defaultInput: { array: [4, 2, 7, 1, 9, 3, 6, 8], target: 9 },
    generate: generateLinearSearch,
  },
];
