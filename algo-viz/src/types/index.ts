// ─── Highlight semantics ──────────────────────────────────────────────────────
export type HighlightColor =
  | 'current'    // the element actively being examined
  | 'visiting'   // in the process of being explored (BFS/DFS frontier)
  | 'visited'    // already fully processed
  | 'comparing'  // being compared to another element
  | 'found'      // search target located
  | 'path'       // part of a discovered path
  | 'sorted'     // confirmed in its final sorted position
  | 'left'       // left pointer / lo boundary
  | 'right'      // right pointer / hi boundary
  | 'mid'        // middle pointer in binary search / divide-and-conquer
  | 'dp-current' // the DP cell currently being filled
  | 'dp-source'  // a dependency cell used to compute dp-current
  | 'head'       // head pointer (linked list, slow pointer)
  | 'tail'       // tail pointer (fast pointer)
  | 'swapping'   // two elements being swapped
  | 'source'     // BFS/DFS start cell
  | 'target'     // destination cell
  | 'result'     // final answer cell
  | 'excluded';  // eliminated half (binary search), completed region

// ─── Language support ─────────────────────────────────────────────────────────
export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'c';

// ─── Complexity ───────────────────────────────────────────────────────────────
export interface Complexity {
  time: string;
  space: string;
  reasoning: string;
}

// ─── Data-structure highlight types ──────────────────────────────────────────
export interface CellHighlight {
  index: number;
  color: HighlightColor;
  label?: string;
}

export interface MatrixHighlight {
  row: number;
  col: number;
  color: HighlightColor;
  label?: string;
}

// ─── Tree ─────────────────────────────────────────────────────────────────────
export interface TreeNode {
  id: number;
  val: number | string;
  left?: TreeNode;
  right?: TreeNode;
  highlight?: HighlightColor;
}

// ─── Data-structure state snapshots ──────────────────────────────────────────
export interface ArrayState {
  id: string;
  label?: string;
  data: (number | string | null)[];
  highlights: CellHighlight[];
  pointers?: { index: number; label: string; color: string }[];
}

export interface MatrixState {
  data: (number | string | boolean)[][];
  highlights: MatrixHighlight[];
  visitedCells?: boolean[][];
  pathCells?: [number, number][];
}

export interface TreeState {
  root: TreeNode | null;
  highlights: { id: number; color: HighlightColor }[];
  /** Node ids currently in the BFS queue */
  queue?: number[];
}

export interface DPTableState {
  data: (number | string)[][];
  highlights: { row: number; col: number; color: HighlightColor }[];
  rowLabels?: string[];
  colLabels?: string[];
  is1D?: boolean;
  dpArray?: (number | string)[];
}

export interface HeapState {
  data: number[];
  highlights: CellHighlight[];
  sortedFrom?: number;
}

export interface HashMapState {
  entries: { key: string | number; value: string | number; highlight?: HighlightColor }[];
}

export interface CallStackFrame {
  id: string;
  funcName: string;
  args: Record<string, unknown>;
  returnValue?: unknown;
  isActive: boolean;
  depth: number;
  highlight?: HighlightColor;
}

// ─── Linked List ──────────────────────────────────────────────────────────────
export interface LinkedListState {
  /** Values in order from head to tail */
  nodes: (number | string | null)[];
  /** Index of the node currently being pointed to (e.g. curr, node, ptr) */
  activeIndex?: number;
  /** Named pointer labels on specific node indices */
  pointers?: { index: number; label: string; color: string }[];
}

// ─── Graph (adjacency-list representation) ────────────────────────────────────
export interface GraphVizState {
  /** All node labels */
  nodes: string[];
  /** Directed or undirected edge pairs */
  edges: { from: string; to: string }[];
  directed: boolean;
  /** Per-node highlight colours (key = node label) */
  nodeHighlights?: Record<string, HighlightColor>;
}

// ─── Frame ────────────────────────────────────────────────────────────────────
/**
 * A single execution step.  Every field except `line` and `description` is
 * optional — only the fields relevant to the current algorithm are populated.
 */
export interface Frame {
  /** Line number in the reference JavaScript code */
  line: number;
  description: string;
  /** Scalar / primitive variable values shown in the description bar */
  variables?: Record<string, unknown>;
  arrays?: ArrayState[];
  matrix?: MatrixState;
  tree?: TreeState;
  linkedList?: LinkedListState;
  graph?: GraphVizState;
  dpTable?: DPTableState;
  heap?: HeapState;
  hashmap?: HashMapState;
  callStack?: CallStackFrame[];
}

// ─── Algorithm registry ───────────────────────────────────────────────────────
export type AlgorithmCategory =
  | 'arrays'
  | 'searching'
  | 'two-pointers'
  | 'sliding-window'
  | 'hashmaps'
  | 'graphs'
  | 'trees'
  | 'recursion'
  | 'backtracking'
  | 'heap'
  | 'dp-1d'
  | 'dp-2d';

export type LineMap = Partial<Record<Language, Record<number, number>>>;

export interface Algorithm {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  complexity: Complexity;
  codes: Record<Language, string>;
  lineMap?: LineMap;
  defaultInput?: Record<string, unknown>;
  generate: (input: Record<string, unknown>) => Frame[];
}

export interface AlgorithmGroup {
  id: AlgorithmCategory;
  label: string;
  icon: string;
  algorithms: Algorithm[];
}
