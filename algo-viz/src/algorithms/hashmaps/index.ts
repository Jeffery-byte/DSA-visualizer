import type { Algorithm, Frame, ArrayState, HashMapState } from '../../types';

function makeArray(data: (number | string | null)[], highlights: ArrayState['highlights'] = [], pointers: ArrayState['pointers'] = [], id = 'arr', label = 'Array'): ArrayState {
  return { id, label, data, highlights, pointers };
}

// ─── Two Sum with HashMap ──────────────────────────────────────────────────────
const twoSumHashCode = `function twoSum(nums, target) {
  const map = new Map(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }
  return [];
}`;

function generateTwoSumHash(input: Record<string, unknown>): Frame[] {
  const nums: number[] = [...((input.array as number[]) ?? [2, 7, 11, 15])];
  const target = (input.target as number) ?? 9;
  const frames: Frame[] = [];
  const map = new Map<number, number>();

  frames.push({
    line: 1,
    description: `Two Sum using HashMap, target=${target}`,
    arrays: [makeArray([...nums])],
    hashmap: { entries: [] },
  });

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    const hmState: HashMapState = {
      entries: Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v })),
    };

    frames.push({
      line: 4,
      description: `i=${i}: nums[i]=${nums[i]}, complement = ${target}-${nums[i]} = ${complement}`,
      arrays: [makeArray([...nums], [{ index: i, color: 'current' }], [{ index: i, label: 'i', color: '#3b82f6' }])],
      hashmap: hmState,
      variables: { i, 'nums[i]': nums[i], complement },
    });

    if (map.has(complement)) {
      const foundIdx = map.get(complement)!;
      frames.push({
        line: 6,
        description: `Found complement ${complement} at index ${foundIdx}! Return [${foundIdx}, ${i}]`,
        arrays: [makeArray([...nums], [{ index: foundIdx, color: 'found' }, { index: i, color: 'found' }])],
        hashmap: {
          entries: Array.from(map.entries()).map(([k, v]) => ({
            key: k,
            value: v,
            highlight: k === complement ? 'found' : undefined,
          })),
        },
      });
      return frames;
    }

    map.set(nums[i], i);
    frames.push({
      line: 9,
      description: `Store map[${nums[i]}] = ${i}`,
      arrays: [makeArray([...nums], [{ index: i, color: 'visited' }])],
      hashmap: {
        entries: Array.from(map.entries()).map(([k, v]) => ({
          key: k,
          value: v,
          highlight: k === nums[i] ? 'current' : undefined,
        })),
      },
    });
  }

  frames.push({ line: 11, description: 'No pair found', arrays: [makeArray([...nums])], hashmap: { entries: [] } });
  return frames;
}

// ─── Group Anagrams ────────────────────────────────────────────────────────────
const groupAnagramsCode = `function groupAnagrams(words) {
  const map = new Map();

  for (const word of words) {
    const key = word.split('').sort().join('');

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(word);
  }

  return [...map.values()];
}`;

function generateGroupAnagrams(input: Record<string, unknown>): Frame[] {
  const words: string[] = [...((input.words as string[]) ?? ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])];
  const frames: Frame[] = [];
  const map = new Map<string, string[]>();

  frames.push({
    line: 1,
    description: 'Group anagrams together using sorted-key HashMap',
    arrays: [{ id: 'words', label: 'Words', data: words, highlights: [] }],
    hashmap: { entries: [] },
  });

  words.forEach((word, idx) => {
    const key = word.split('').sort().join('');

    frames.push({
      line: 4,
      description: `Word "${word}" → sorted key = "${key}"`,
      arrays: [{ id: 'words', label: 'Words', data: words, highlights: [{ index: idx, color: 'current' }] }],
      hashmap: { entries: Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v.join(', ') })) },
    });

    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(word);

    frames.push({
      line: 9,
      description: `Added "${word}" to group "${key}"`,
      arrays: [{ id: 'words', label: 'Words', data: words, highlights: [{ index: idx, color: 'visited' }] }],
      hashmap: {
        entries: Array.from(map.entries()).map(([k, v]) => ({
          key: k,
          value: v.join(', '),
          highlight: k === key ? 'current' : undefined,
        })),
      },
    });
  });

  frames.push({
    line: 12,
    description: `Done! ${map.size} anagram groups found`,
    arrays: [{ id: 'words', label: 'Words', data: words, highlights: [] }],
    hashmap: { entries: Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v.join(', '), highlight: 'sorted' as const })) },
  });
  return frames;
}

export const hashmapAlgorithms: Algorithm[] = [
  {
    id: 'two-sum-hashmap',
    name: 'Two Sum (HashMap)',
    category: 'hashmaps',
    description: 'Use a HashMap to find complement in O(1), achieving O(n) overall.',
    code: twoSumHashCode,
    defaultInput: { array: [2, 7, 11, 15], target: 9 },
    generate: generateTwoSumHash,
  },
  {
    id: 'group-anagrams',
    name: 'Group Anagrams',
    category: 'hashmaps',
    description: 'Group words that are anagrams using sorted characters as HashMap keys.',
    code: groupAnagramsCode,
    defaultInput: { words: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] },
    generate: generateGroupAnagrams,
  },
];
