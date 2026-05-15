import type { Algorithm, Frame, ArrayState, HashMapState } from '../../types';

function makeArray(data: (number | string | null)[], highlights: ArrayState['highlights'] = [], pointers: ArrayState['pointers'] = [], id = 'arr', label = 'Array'): ArrayState {
  return { id, label, data, highlights, pointers };
}

// ─── Two Sum with HashMap ──────────────────────────────────────────────────────
function generateTwoSumHash(input: Record<string, unknown>): Frame[] {
  const nums: number[] = [...((input.array as number[]) ?? [2, 7, 11, 15])];
  const target = (input.target as number) ?? 9;
  const frames: Frame[] = [];
  const map = new Map<number, number>();

  frames.push({ line: 1, description: `Two Sum using HashMap, target=${target}`, arrays: [makeArray([...nums])], hashmap: { entries: [] } });

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    const hmState: HashMapState = { entries: Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v })) };

    frames.push({
      line: 4,
      description: `i=${i}: nums[i]=${nums[i]}, complement = ${target}−${nums[i]} = ${complement}`,
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
        hashmap: { entries: Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v, highlight: k === complement ? 'found' as const : undefined })) },
      });
      return frames;
    }

    map.set(nums[i], i);
    frames.push({
      line: 9,
      description: `Store map[${nums[i]}] = ${i}`,
      arrays: [makeArray([...nums], [{ index: i, color: 'visited' }])],
      hashmap: { entries: Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v, highlight: k === nums[i] ? 'current' as const : undefined })) },
    });
  }

  frames.push({ line: 11, description: 'No pair found', arrays: [makeArray([...nums])], hashmap: { entries: [] } });
  return frames;
}

// ─── Group Anagrams ────────────────────────────────────────────────────────────
function generateGroupAnagrams(input: Record<string, unknown>): Frame[] {
  const words: string[] = [...((input.words as string[]) ?? ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])];
  const frames: Frame[] = [];
  const map = new Map<string, string[]>();

  frames.push({ line: 1, description: 'Group anagrams together using sorted-key HashMap', arrays: [{ id: 'words', label: 'Words', data: words, highlights: [] }], hashmap: { entries: [] } });

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
      hashmap: { entries: Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v.join(', '), highlight: k === key ? 'current' as const : undefined })) },
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
    description: 'Store each element\'s index in a HashMap; for each element check if its complement already exists.',
    complexity: {
      time: 'O(n)',
      space: 'O(n)',
      reasoning:
        'We iterate through the array once — each iteration does an O(1) HashMap lookup (has) and an O(1) HashMap insert (set), giving O(n) overall. The trade-off vs. the brute-force O(n²) nested loop is the extra space: in the worst case we store every element in the HashMap before finding the answer, costing O(n) space. This is the classic time–space trade-off.',
    },
    codes: {
      javascript: `function twoSum(nums, target) {
  const map = new Map(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }
  return [];
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }

    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    seen = {}          # value → index

    for i, num in enumerate(nums):
        complement = target - num

        if complement in seen:
            return [seen[complement], i]

        seen[num] = i

    return []`,
      java: `public static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();

    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];

        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }

        map.put(nums[i], i);
    }
    return new int[]{};
}`,
      c: `/* C uses a simple linear-probe hash table */
int* twoSum(int* nums, int n, int target) {
    static int result[2];
    int *keys   = calloc(20011, sizeof(int));
    int *vals   = calloc(20011, sizeof(int));

    for (int i = 0; i < n; i++) {
        int comp = target - nums[i];
        int h = ((comp % 20011) + 20011) % 20011;
        if (keys[h] == comp && vals[h] != 0) {
            result[0] = vals[h] - 1;
            result[1] = i;
            return result;
        }
        int hi = ((nums[i] % 20011) + 20011) % 20011;
        keys[hi] = nums[i]; vals[hi] = i + 1;
    }
    return NULL;
}`,
    },
    lineMap: {
      typescript: { 1: 1, 4: 4, 6: 6, 9: 9, 11: 12 },
      python:     { 1: 1, 4: 4, 6: 6, 9: 9, 11: 10 },
      java:       { 1: 1, 4: 4, 6: 6, 9: 10, 11: 13 },
      c:          { 1: 2, 4: 8, 6: 9, 9: 13, 11: 15 },
    },
    defaultInput: { array: [2, 7, 11, 15], target: 9 },
    generate: generateTwoSumHash,
  },
  {
    id: 'group-anagrams',
    name: 'Group Anagrams',
    category: 'hashmaps',
    description: 'Sort each word\'s characters to produce a canonical key; words with the same key are anagrams.',
    complexity: {
      time: 'O(n · k log k)',
      space: 'O(n · k)',
      reasoning:
        'For each of the n words we sort its k characters — sorting costs O(k log k). The HashMap lookup and insertion are O(k) for key hashing. Total: O(n · k log k). Space is O(n · k) because the HashMap stores all n words (each of length k). If k is treated as a constant (fixed max word length), this simplifies to O(n) time and space.',
    },
    codes: {
      javascript: `function groupAnagrams(words) {
  const map = new Map();

  for (const word of words) {
    const key = word.split('').sort().join('');

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(word);
  }

  return [...map.values()];
}`,
      typescript: `function groupAnagrams(words: string[]): string[][] {
  const map = new Map<string, string[]>();

  for (const word of words) {
    const key = word.split('').sort().join('');

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(word);
  }

  return [...map.values()];
}`,
      python: `def group_anagrams(words):
    from collections import defaultdict
    groups = defaultdict(list)

    for word in words:
        key = ''.join(sorted(word))
        groups[key].append(word)

    return list(groups.values())`,
      java: `public static List<List<String>> groupAnagrams(String[] words) {
    Map<String, List<String>> map = new HashMap<>();

    for (String word : words) {
        char[] chars = word.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);

        map.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
    }

    return new ArrayList<>(map.values());
}`,
      c: `/* Simplified: print groups using sorted-key comparison */
void groupAnagrams(char words[][20], int n) {
    int grouped[100] = {0};

    for (int i = 0; i < n; i++) {
        if (grouped[i]) continue;
        char key[20]; strcpy(key, words[i]);
        /* sort key characters */
        int len = strlen(key);
        for (int a = 0; a < len - 1; a++)
            for (int b = a + 1; b < len; b++)
                if (key[a] > key[b]) { char t=key[a]; key[a]=key[b]; key[b]=t; }
        grouped[i] = 1;
        for (int j = i + 1; j < n; j++) {
            char k2[20]; strcpy(k2, words[j]);
            int l2 = strlen(k2);
            for (int a=0;a<l2-1;a++) for(int b=a+1;b<l2;b++)
                if(k2[a]>k2[b]){char t=k2[a];k2[a]=k2[b];k2[b]=t;}
            if (strcmp(key, k2) == 0) grouped[j] = 1;
        }
    }
}`,
    },
    lineMap: {
      typescript: { 1: 1, 4: 4, 9: 9, 12: 13 },
      python:     { 1: 1, 4: 5, 9: 6, 12: 8 },
      java:       { 1: 1, 4: 4, 9: 9, 12: 12 },
      c:          { 1: 2, 4: 5, 9: 13, 12: 15 },
    },
    defaultInput: { words: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] },
    generate: generateGroupAnagrams,
  },
];
