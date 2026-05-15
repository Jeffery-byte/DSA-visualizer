export type HighlightColor =
  | 'current'
  | 'visiting'
  | 'visited'
  | 'comparing'
  | 'found'
  | 'path'
  | 'sorted'
  | 'left'
  | 'right'
  | 'mid'
  | 'pivot'
  | 'dp-current'
  | 'dp-source'
  | 'head'
  | 'tail'
  | 'swapping'
  | 'source'
  | 'target'
  | 'in-stack'
  | 'result'
  | 'excluded';

export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'c';

export interface Complexity {
  time: string;
  space: string;
  /** Full explanation of why these complexities hold */
  reasoning: string;
}

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

export interface TreeNode {
  id: number;
  val: number | string;
  left?: TreeNode;
  right?: TreeNode;
  children?: TreeNode[];
  highlight?: HighlightColor;
  x?: number;
  y?: number;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  highlight?: HighlightColor;
  distance?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  highlight?: HighlightColor;
  directed?: boolean;
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
  queue?: number[];
  activeEdges?: [number, number][];
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  distances?: Record<string, number | typeof Infinity>;
  visited?: string[];
  queue?: string[];
  stack?: string[];
  path?: string[];
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

export interface Frame {
  line: number;
  description: string;
  variables?: Record<string, unknown>;
  arrays?: ArrayState[];
  matrix?: MatrixState;
  tree?: TreeState;
  graph?: GraphState;
  dpTable?: DPTableState;
  heap?: HeapState;
  hashmap?: HashMapState;
  callStack?: CallStackFrame[];
}

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

/**
 * Maps a frame's JS line number → the equivalent line in the target language.
 * Unmapped lines fall back to no highlight.
 */
export type LineMap = Partial<Record<Language, Record<number, number>>>;

export interface Algorithm {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  complexity: Complexity;
  /** Code listing for every supported language */
  codes: Record<Language, string>;
  /**
   * Maps frame.line (JavaScript reference) → line number in each language.
   * javascript and typescript always identity-map unless specified.
   */
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
