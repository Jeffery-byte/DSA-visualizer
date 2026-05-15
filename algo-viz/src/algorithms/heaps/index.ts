import type { Algorithm, Frame, HeapState, ArrayState } from '../../types';

function makeHeap(data: number[], highlights: HeapState['highlights'], sortedFrom?: number): HeapState {
  return { data: [...data], highlights, sortedFrom };
}

// ─── Build Max Heap + Heap Sort ────────────────────────────────────────────────
const heapSortCode = `function heapSort(arr) {
  const n = arr.length;

  // Build max-heap (heapify from last non-leaf)
  for (let i = Math.floor(n/2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]]; // move max to end
    heapify(arr, i, 0);
  }
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2*i + 1, right = 2*i + 2;

  if (left < n && arr[left] > arr[largest])  largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`;

function generateHeapSort(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [4, 10, 3, 5, 1, 8, 7, 2])];
  const n = arr.length;
  const frames: Frame[] = [];

  frames.push({ line: 1, description: 'Heap Sort: build max-heap, then extract', heap: makeHeap([...arr], []) });

  function heapify(n: number, i: number, sortedFrom: number): void {
    let largest = i;
    const left = 2 * i + 1, right = 2 * i + 2;

    frames.push({
      line: 15,
      description: `heapify(n=${n}, i=${i}): check children`,
      heap: makeHeap([...arr], [{ index: i, color: 'current' }], sortedFrom),
    });

    if (left < n && arr[left] > arr[largest]) {
      frames.push({ line: 18, description: `Left child arr[${left}]=${arr[left]} > arr[${largest}]=${arr[largest]}, largest=${left}`, heap: makeHeap([...arr], [{ index: i, color: 'comparing' }, { index: left, color: 'comparing' }], sortedFrom) });
      largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
      frames.push({ line: 19, description: `Right child arr[${right}]=${arr[right]} > arr[${largest}]=${arr[largest]}, largest=${right}`, heap: makeHeap([...arr], [{ index: i, color: 'comparing' }, { index: right, color: 'comparing' }], sortedFrom) });
      largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      frames.push({ line: 22, description: `Swap arr[${i}]=${arr[i]} with arr[${largest}]=${arr[largest]}`, heap: makeHeap([...arr], [{ index: i, color: 'swapping' }, { index: largest, color: 'swapping' }], sortedFrom) });
      heapify(n, largest, sortedFrom);
    }
  }

  // Build max-heap
  frames.push({ line: 4, description: `Build max-heap: heapify from i=${Math.floor(n / 2) - 1} down to 0`, heap: makeHeap([...arr], []) });
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i, n);
  }
  frames.push({ line: 6, description: `Max-heap built! Root=${arr[0]} is the maximum`, heap: makeHeap([...arr], [{ index: 0, color: 'found' }]) });

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    frames.push({ line: 10, description: `Swap root arr[0]=${arr[0]} with arr[${i}]=${arr[i]}`, heap: makeHeap([...arr], [{ index: 0, color: 'swapping' }, { index: i, color: 'swapping' }], i + 1) });
    [arr[0], arr[i]] = [arr[i], arr[0]];
    frames.push({ line: 11, description: `arr[${i}]=${arr[i]} is now sorted. Heapify remaining ${i} elements`, heap: makeHeap([...arr], [], i) });
    heapify(i, 0, i);
  }

  frames.push({ line: 12, description: 'Heap Sort complete!', heap: makeHeap([...arr], arr.map((_, i) => ({ index: i, color: 'sorted' as const })), 0) });
  return frames;
}

// ─── K Largest Elements ─────────────────────────────────────────────────────────
const kLargestCode = `function kLargest(nums, k) {
  // Min-heap of size k
  const heap = nums.slice(0, k).sort((a, b) => a - b);

  for (let i = k; i < nums.length; i++) {
    if (nums[i] > heap[0]) {
      heap[0] = nums[i];
      // Re-sort (simulate heapify-up)
      heap.sort((a, b) => a - b);
    }
  }

  return heap;
}`;

function generateKLargest(input: Record<string, unknown>): Frame[] {
  const nums: number[] = [...((input.array as number[]) ?? [3, 2, 1, 5, 6, 4, 8, 7])];
  const k = (input.k as number) ?? 3;
  const frames: Frame[] = [];

  const makeArrayState = (heap: number[], numsHighlights: ArrayState['highlights'], heapHighlights: HeapState['highlights']): { arrays: ArrayState[], heap: HeapState } => ({
    arrays: [{ id: 'nums', label: 'Input', data: [...nums], highlights: numsHighlights }],
    heap: { data: [...heap], highlights: heapHighlights },
  });

  const heap: number[] = nums.slice(0, k).sort((a, b) => a - b);
  const initState = makeArrayState(heap, nums.slice(0, k).map((_, i) => ({ index: i, color: 'visiting' as const })), []);

  frames.push({ line: 1, description: `Find K=${k} largest elements`, ...initState });
  frames.push({ line: 3, description: `Build initial min-heap from first ${k} elements`, ...makeArrayState(heap, nums.slice(0, k).map((_, i) => ({ index: i, color: 'visiting' as const })), heap.map((_, i) => ({ index: i, color: 'current' as const }))) });

  for (let i = k; i < nums.length; i++) {
    frames.push({
      line: 5,
      description: `nums[${i}]=${nums[i]} vs heap min=${heap[0]}`,
      ...makeArrayState(heap, [{ index: i, color: 'current' }], [{ index: 0, color: 'comparing' }]),
    });

    if (nums[i] > heap[0]) {
      heap[0] = nums[i];
      heap.sort((a, b) => a - b);
      frames.push({
        line: 7,
        description: `${nums[i]} > ${heap[0]} (was min), replace & re-sort heap`,
        ...makeArrayState(heap, [{ index: i, color: 'found' }], heap.map((_, idx) => ({ index: idx, color: 'visiting' as const }))),
      });
    }
  }

  frames.push({
    line: 11,
    description: `K=${k} largest elements: [${heap.join(', ')}]`,
    ...makeArrayState(heap, [], heap.map((_, i) => ({ index: i, color: 'sorted' as const }))),
  });
  return frames;
}

export const heapAlgorithms: Algorithm[] = [
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'heap',
    description: 'Build max-heap, then repeatedly extract maximum to sort.',
    code: heapSortCode,
    defaultInput: { array: [4, 10, 3, 5, 1, 8, 7, 2] },
    generate: generateHeapSort,
  },
  {
    id: 'k-largest',
    name: 'K Largest Elements',
    category: 'heap',
    description: 'Maintain a min-heap of size K to find K largest elements.',
    code: kLargestCode,
    defaultInput: { array: [3, 2, 1, 5, 6, 4, 8, 7], k: 3 },
    generate: generateKLargest,
  },
];
