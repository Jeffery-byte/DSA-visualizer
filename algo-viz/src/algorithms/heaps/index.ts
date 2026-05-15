import type { Algorithm, Frame, HeapState, ArrayState } from '../../types';

function makeHeap(data: number[], highlights: HeapState['highlights'], sortedFrom?: number): HeapState {
  return { data: [...data], highlights, sortedFrom };
}

// ─── Heap Sort ────────────────────────────────────────────────────────────────
function generateHeapSort(input: Record<string, unknown>): Frame[] {
  const arr: number[] = [...((input.array as number[]) ?? [4, 10, 3, 5, 1, 8, 7, 2])];
  const n = arr.length;
  const frames: Frame[] = [];
  frames.push({ line: 1, description: 'Heap Sort: build max-heap, then extract', heap: makeHeap([...arr], []) });

  function heapify(n: number, i: number, sortedFrom: number): void {
    let largest = i;
    const left = 2 * i + 1, right = 2 * i + 2;
    frames.push({ line: 15, description: `heapify(n=${n}, i=${i}): check children [${left}] and [${right}]`, heap: makeHeap([...arr], [{ index: i, color: 'current' }], sortedFrom) });

    if (left < n && arr[left] > arr[largest]) {
      frames.push({ line: 18, description: `Left arr[${left}]=${arr[left]} > arr[${largest}]=${arr[largest]}, largest=${left}`, heap: makeHeap([...arr], [{ index: i, color: 'comparing' }, { index: left, color: 'comparing' }], sortedFrom) });
      largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
      frames.push({ line: 19, description: `Right arr[${right}]=${arr[right]} > arr[${largest}]=${arr[largest]}, largest=${right}`, heap: makeHeap([...arr], [{ index: i, color: 'comparing' }, { index: right, color: 'comparing' }], sortedFrom) });
      largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      frames.push({ line: 22, description: `Swap arr[${i}]↔arr[${largest}]`, heap: makeHeap([...arr], [{ index: i, color: 'swapping' }, { index: largest, color: 'swapping' }], sortedFrom) });
      heapify(n, largest, sortedFrom);
    }
  }

  frames.push({ line: 4, description: `Build max-heap: heapify from i=${Math.floor(n / 2) - 1} down to 0`, heap: makeHeap([...arr], []) });
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i, n);
  frames.push({ line: 6, description: `Max-heap built! Root=${arr[0]} is maximum`, heap: makeHeap([...arr], [{ index: 0, color: 'found' }]) });

  for (let i = n - 1; i > 0; i--) {
    frames.push({ line: 10, description: `Swap root arr[0]=${arr[0]} ↔ arr[${i}]=${arr[i]}`, heap: makeHeap([...arr], [{ index: 0, color: 'swapping' }, { index: i, color: 'swapping' }], i + 1) });
    [arr[0], arr[i]] = [arr[i], arr[0]];
    frames.push({ line: 11, description: `arr[${i}]=${arr[i]} sorted. Heapify remaining ${i}`, heap: makeHeap([...arr], [], i) });
    heapify(i, 0, i);
  }

  frames.push({ line: 12, description: 'Heap Sort complete!', heap: makeHeap([...arr], arr.map((_, i) => ({ index: i, color: 'sorted' as const })), 0) });
  return frames;
}

// ─── K Largest Elements ───────────────────────────────────────────────────────
function generateKLargest(input: Record<string, unknown>): Frame[] {
  const nums: number[] = [...((input.array as number[]) ?? [3, 2, 1, 5, 6, 4, 8, 7])];
  const k = (input.k as number) ?? 3;
  const frames: Frame[] = [];

  const makeArrayState = (heap: number[], numsHl: ArrayState['highlights'], heapHl: HeapState['highlights']): { arrays: ArrayState[]; heap: HeapState } => ({
    arrays: [{ id: 'nums', label: 'Input', data: [...nums], highlights: numsHl }],
    heap: { data: [...heap], highlights: heapHl },
  });

  const heap: number[] = nums.slice(0, k).sort((a, b) => a - b);
  frames.push({ line: 1, description: `Find K=${k} largest elements using a min-heap`, ...makeArrayState(heap, [], []) });
  frames.push({ line: 3, description: `Initial min-heap from first ${k} elements`, ...makeArrayState(heap, nums.slice(0, k).map((_, i) => ({ index: i, color: 'visiting' as const })), heap.map((_, i) => ({ index: i, color: 'current' as const }))) });

  for (let i = k; i < nums.length; i++) {
    frames.push({
      line: 5,
      description: `nums[${i}]=${nums[i]} vs heap minimum=${heap[0]}`,
      ...makeArrayState(heap, [{ index: i, color: 'current' }], [{ index: 0, color: 'comparing' }]),
    });

    if (nums[i] > heap[0]) {
      heap[0] = nums[i];
      heap.sort((a, b) => a - b);
      frames.push({
        line: 7,
        description: `${nums[i]} > ${heap[0]} (was min) → replace & re-heapify`,
        ...makeArrayState(heap, [{ index: i, color: 'found' }], heap.map((_, idx) => ({ index: idx, color: 'visiting' as const }))),
      });
    }
  }

  frames.push({
    line: 11,
    description: `K=${k} largest: [${heap.join(', ')}]`,
    ...makeArrayState(heap, [], heap.map((_, i) => ({ index: i, color: 'sorted' as const }))),
  });
  return frames;
}

export const heapAlgorithms: Algorithm[] = [
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'heap',
    description: 'Phase 1: build a max-heap in O(n). Phase 2: swap root (max) to end and re-heapify n−1 times.',
    complexity: {
      time: 'O(n log n)',
      space: 'O(1)',
      reasoning:
        'Building the max-heap takes O(n) time (not O(n log n) — the sum of heapify costs at each level telescopes to linear). Each of the n−1 extract steps involves swapping the root to its final position and then re-heapifying the remaining heap in O(log n). Total: O(n) + O(n log n) = O(n log n). Space is O(1) because everything is done in-place; no auxiliary arrays are needed (the recursion in heapify is O(log n) stack depth, which is often counted as extra space).',
    },
    codes: {
      javascript: `function heapSort(arr) {
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

  if (left < n && arr[left] > arr[largest])   largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
      typescript: `function heapSort(arr: number[]): void {
  const n = arr.length;

  for (let i = Math.floor(n/2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
}

function heapify(arr: number[], n: number, i: number): void {
  let largest = i;
  const left = 2*i + 1, right = 2*i + 2;

  if (left < n && arr[left] > arr[largest])   largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
      python: `def heap_sort(arr):
    n = len(arr)

    # Build max-heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)

    # Extract elements one by one
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)

def heapify(arr, n, i):
    largest = i
    left, right = 2*i + 1, 2*i + 2

    if left < n and arr[left] > arr[largest]:   largest = left
    if right < n and arr[right] > arr[largest]: largest = right

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)`,
      java: `public static void heapSort(int[] arr) {
    int n = arr.length;

    for (int i = n/2 - 1; i >= 0; i--)
        heapify(arr, n, i);

    for (int i = n - 1; i > 0; i--) {
        int tmp = arr[0]; arr[0] = arr[i]; arr[i] = tmp;
        heapify(arr, i, 0);
    }
}

static void heapify(int[] arr, int n, int i) {
    int largest = i, left = 2*i+1, right = 2*i+2;

    if (left  < n && arr[left]  > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;

    if (largest != i) {
        int tmp = arr[i]; arr[i] = arr[largest]; arr[largest] = tmp;
        heapify(arr, n, largest);
    }
}`,
      c: `void heapify(int arr[], int n, int i) {
    int largest = i, left = 2*i+1, right = 2*i+2;

    if (left  < n && arr[left]  > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;

    if (largest != i) {
        int tmp = arr[i]; arr[i] = arr[largest]; arr[largest] = tmp;
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {
    for (int i = n/2 - 1; i >= 0; i--)
        heapify(arr, n, i);

    for (int i = n - 1; i > 0; i--) {
        int tmp = arr[0]; arr[0] = arr[i]; arr[i] = tmp;
        heapify(arr, i, 0);
    }
}`,
    },
    lineMap: {
      typescript: { 1: 1, 4: 4, 6: 6, 10: 9, 11: 10, 12: 11, 15: 14, 18: 17, 19: 18, 22: 21 },
      python:     { 1: 1, 4: 4, 6: 6, 10: 9, 11: 10, 12: 11, 15: 13, 18: 16, 19: 17, 22: 20 },
      java:       { 1: 1, 4: 4, 6: 7, 10: 7, 11: 7, 12: 8, 15: 13, 18: 15, 19: 16, 22: 19 },
      c:          { 1: 10, 4: 12, 6: 13, 10: 15, 11: 16, 12: 17, 15: 1, 18: 3, 19: 4, 22: 7 },
    },
    defaultInput: { array: [4, 10, 3, 5, 1, 8, 7, 2] },
    generate: generateHeapSort,
  },
  {
    id: 'k-largest',
    name: 'K Largest Elements',
    category: 'heap',
    description: 'Keep a min-heap of size K: if a new element is larger than the heap\'s minimum, replace it.',
    complexity: {
      time: 'O(n log k)',
      space: 'O(k)',
      reasoning:
        'We process all n elements. For each of the n−k elements after the initial window, we may push/pop from the heap in O(log k). The initial heap build costs O(k). Total: O(k) + O((n−k) log k) = O(n log k). This is optimal because finding K largest requires at least Ω(n) just to read the input. The heap holds exactly k elements at all times, giving O(k) space. An alternative using a max-heap of size n takes O(n + k log n).',
    },
    codes: {
      javascript: `function kLargest(nums, k) {
  // Min-heap of size k: smallest of the k largest at top
  const heap = nums.slice(0, k).sort((a, b) => a - b);

  for (let i = k; i < nums.length; i++) {
    if (nums[i] > heap[0]) {
      heap[0] = nums[i];
      heap.sort((a, b) => a - b); // re-heapify
    }
  }

  return heap; // the k largest elements
}`,
      typescript: `function kLargest(nums: number[], k: number): number[] {
  const heap = nums.slice(0, k).sort((a, b) => a - b);

  for (let i = k; i < nums.length; i++) {
    if (nums[i] > heap[0]) {
      heap[0] = nums[i];
      heap.sort((a, b) => a - b);
    }
  }

  return heap;
}`,
      python: `import heapq

def k_largest(nums, k):
    # heapq is a min-heap in Python
    heap = nums[:k]
    heapq.heapify(heap)

    for num in nums[k:]:
        if num > heap[0]:
            heapq.heapreplace(heap, num)

    return sorted(heap)`,
      java: `public static int[] kLargest(int[] nums, int k) {
    // Use a min-heap (PriorityQueue default)
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int i = 0; i < k; i++) heap.offer(nums[i]);

    for (int i = k; i < nums.length; i++) {
        if (nums[i] > heap.peek()) {
            heap.poll();
            heap.offer(nums[i]);
        }
    }

    return heap.stream().mapToInt(x->x).toArray();
}`,
      c: `/* Min-heapify down helper */
void minHeapify(int heap[], int n, int i) {
    int small=i, l=2*i+1, r=2*i+2;
    if (l<n && heap[l]<heap[small]) small=l;
    if (r<n && heap[r]<heap[small]) small=r;
    if (small!=i) {
        int t=heap[i]; heap[i]=heap[small]; heap[small]=t;
        minHeapify(heap, n, small);
    }
}

int* kLargest(int nums[], int n, int k) {
    int* heap = malloc(k * sizeof(int));
    for (int i=0;i<k;i++) heap[i]=nums[i];
    /* build min-heap */
    for (int i=k/2-1;i>=0;i--) minHeapify(heap,k,i);

    for (int i = k; i < n; i++) {
        if (nums[i] > heap[0]) {
            heap[0] = nums[i];
            minHeapify(heap, k, 0);
        }
    }
    return heap;
}`,
    },
    lineMap: {
      typescript: { 1: 1, 3: 2, 5: 4, 7: 6, 11: 10 },
      python:     { 1: 3, 3: 5, 5: 7, 7: 8, 11: 10 },
      java:       { 1: 1, 3: 3, 5: 6, 7: 8, 11: 12 },
      c:          { 1: 12, 3: 14, 5: 19, 7: 21, 11: 24 },
    },
    defaultInput: { array: [3, 2, 1, 5, 6, 4, 8, 7], k: 3 },
    generate: generateKLargest,
  },
];
