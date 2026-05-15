/**
 * Runtime variable detector.
 *
 * Given a snapshot of variable names → values captured at a single execution
 * step, this module infers which data structures are present and maps them to
 * the appropriate Frame visualization fields.
 *
 * Detection priority (first match wins per variable):
 *   1. Tree node    {val/value, left?, right?}  → TreeState
 *   2. Linked list  {val/value, next}            → LinkedListState
 *   3. 2-D array    Array<Array>                 → MatrixState
 *   4. 1-D array    Array<primitive>             → ArrayState + pointer labels
 *   5. Adjacency list {node: neighbor[]}         → GraphVizState
 *   6. Plain object                              → HashMapState
 *   7. Scalars                                   → variables panel
 */

import type {
  Frame,
  ArrayState,
  MatrixState,
  HashMapState,
  HighlightColor,
  TreeNode,
  TreeState,
  LinkedListState,
  GraphVizState,
} from '../types';

// ─── Public snapshot type ──────────────────────────────────────────────────────
export type VarSnapshot = Record<string, unknown>;

// ─── Deep-clone helper (limits depth and size for safety) ─────────────────────
export function safeClone(value: unknown, depth = 0): unknown {
  if (depth > 5) return '…';
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    const arr = value.length > 300 ? value.slice(0, 300) : value;
    return arr.map(v => safeClone(v, depth + 1));
  }
  const obj: Record<string, unknown> = {};
  let count = 0;
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (count++ > 60) { obj['…'] = '(truncated)'; break; }
    obj[k] = safeClone(v, depth + 1);
  }
  return obj;
}

// ─── Pointer name table ────────────────────────────────────────────────────────
const POINTER_NAMES = new Set([
  'i','j','k','l','r','m','n',
  'lo','hi','low','high',
  'left','right','mid','middle',
  'start','end','ptr','idx','index','pos',
  'cur','curr','p','q',
  'slow','fast','head','tail',
]);

const POINTER_STYLE: Record<string, { highlight: HighlightColor; color: string }> = {
  lo:    { highlight: 'left',     color: '#22c55e' },
  low:   { highlight: 'left',     color: '#22c55e' },
  left:  { highlight: 'left',     color: '#22c55e' },
  l:     { highlight: 'left',     color: '#22c55e' },
  hi:    { highlight: 'right',    color: '#ef4444' },
  high:  { highlight: 'right',    color: '#ef4444' },
  right: { highlight: 'right',    color: '#ef4444' },
  r:     { highlight: 'right',    color: '#ef4444' },
  mid:   { highlight: 'mid',      color: '#eab308' },
  middle:{ highlight: 'mid',      color: '#eab308' },
  m:     { highlight: 'mid',      color: '#eab308' },
  i:     { highlight: 'current',  color: '#3b82f6' },
  j:     { highlight: 'comparing',color: '#a855f7' },
  k:     { highlight: 'current',  color: '#3b82f6' },
  slow:  { highlight: 'head',     color: '#06b6d4' },
  fast:  { highlight: 'tail',     color: '#f97316' },
  head:  { highlight: 'head',     color: '#06b6d4' },
  tail:  { highlight: 'tail',     color: '#f97316' },
  p:     { highlight: 'current',  color: '#3b82f6' },
  q:     { highlight: 'comparing',color: '#a855f7' },
};

// ─── Type guards ──────────────────────────────────────────────────────────────

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Is v a tree-like node? Must have a value field AND at least one of
 * left / right (even if null), to distinguish from other objects.
 */
function isTreeNode(v: unknown): boolean {
  if (!isObj(v)) return false;
  const hasVal = 'val' in v || 'value' in v || 'data' in v;
  const hasChild = 'left' in v || 'right' in v;
  return hasVal && hasChild;
}

/**
 * Is v a linked-list node? Has a value field AND a `next` field,
 * but NOT left/right (which would make it a tree).
 */
function isLinkedListNode(v: unknown): boolean {
  if (!isObj(v)) return false;
  const hasVal  = 'val' in v || 'value' in v || 'data' in v;
  const hasNext = 'next' in v;
  const noTree  = !('left' in v) && !('right' in v);
  return hasVal && hasNext && noTree;
}

function isPrimitiveArray(v: unknown): v is (number | string | null)[] {
  return (
    Array.isArray(v) && v.length > 0 && !Array.isArray(v[0]) &&
    v.every(el => el === null || typeof el === 'number' ||
                  typeof el === 'string' || typeof el === 'boolean')
  );
}

function isMatrix(v: unknown): v is (number | string)[][] {
  if (!Array.isArray(v) || v.length === 0) return false;
  return Array.isArray(v[0]) && v.every(r => Array.isArray(r));
}

/**
 * Is v an adjacency list? Object whose every value is an array
 * of numbers or strings (neighbor ids).
 */
function isAdjacencyList(v: unknown): boolean {
  if (!isObj(v)) return false;
  const entries = Object.entries(v);
  if (entries.length < 2) return false; // need at least 2 nodes to be interesting
  return entries.every(([, neighbors]) =>
    Array.isArray(neighbors) &&
    (neighbors as unknown[]).every(n => typeof n === 'number' || typeof n === 'string')
  );
}

function isHashLike(v: unknown): v is Record<string, unknown> {
  if (!isObj(v)) return false;
  return Object.keys(v).length > 0;
}

// ─── Tree builder ─────────────────────────────────────────────────────────────
let _treeIdCounter = 0;
export function resetTreeIds() { _treeIdCounter = 0; }

function buildTreeNode(obj: unknown, depth = 0): TreeNode | null {
  if (!isObj(obj) || depth > 20) return null;

  const val = (obj.val ?? obj.value ?? obj.data) as number | string | undefined;
  if (val === undefined && depth > 0) return null;

  const id = _treeIdCounter++;
  const left  = buildTreeNode(obj.left  ?? null, depth + 1) ?? undefined;
  const right = buildTreeNode(obj.right ?? null, depth + 1) ?? undefined;

  return { id, val: val ?? '?', left, right };
}

function countTreeNodes(obj: unknown, depth = 0): number {
  if (!isObj(obj) || depth > 25) return 0;
  return 1 + countTreeNodes(obj.left ?? null, depth + 1) +
             countTreeNodes(obj.right ?? null, depth + 1);
}

// ─── Linked list builder ──────────────────────────────────────────────────────
function buildLinkedList(head: unknown): (number | string | null)[] {
  const values: (number | string | null)[] = [];
  const visited = new Set<unknown>();
  let curr = head;
  while (isObj(curr) && !visited.has(curr)) {
    visited.add(curr);
    const val = curr.val ?? curr.value ?? curr.data;
    values.push(val as number | string | null ?? null);
    curr = curr.next ?? null;
    if (values.length > 100) break;
  }
  return values;
}

// ─── Adjacency list builder ───────────────────────────────────────────────────
function buildGraph(adj: Record<string, unknown>): GraphVizState {
  const nodes = Object.keys(adj);
  const edgeSet = new Set<string>();
  const edges: GraphVizState['edges'] = [];

  for (const [from, neighbors] of Object.entries(adj)) {
    for (const to of (neighbors as (string | number)[]).slice(0, 30)) {
      const key = `${from}->${to}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ from, to: String(to) });
      }
    }
  }

  // Heuristic: if every edge has a reverse, treat as undirected
  const directed = edges.some(({ from, to }) =>
    !edges.some(e => e.from === to && e.to === from)
  );

  return { nodes, edges, directed };
}

// ─── Main detector ────────────────────────────────────────────────────────────
export function detectVisualization(vars: VarSnapshot): Partial<Frame> {
  const arrays:     ArrayState[]       = [];
  const scalars:    Record<string, unknown> = {};
  let   matrix:     MatrixState        | undefined;
  let   tree:       TreeState          | undefined;
  let   linkedList: LinkedListState    | undefined;
  let   graph:      GraphVizState      | undefined;
  let   hashmap:    HashMapState       | undefined;

  // ── Pass 1: classify every variable ───────────────────────────────────────
  for (const [name, raw] of Object.entries(vars)) {
    if (name.startsWith('__') || typeof raw === 'function') continue;

    if (isTreeNode(raw)) {
      // Keep only the tree with the most nodes (the main data structure)
      const size = countTreeNodes(raw);
      if (!tree || size > countTreeNodes(tree.root)) {
        _treeIdCounter = 0;
        const root = buildTreeNode(raw);
        if (root) tree = { root, highlights: [] };
      }

    } else if (isLinkedListNode(raw)) {
      if (!linkedList) {
        linkedList = { nodes: buildLinkedList(raw) };
      }

    } else if (isMatrix(raw)) {
      if (!matrix) {
        matrix = { data: raw as (number | string)[][], highlights: [] };
      }

    } else if (isPrimitiveArray(raw)) {
      arrays.push({ id: name, label: name, data: raw, highlights: [], pointers: [] });

    } else if (isAdjacencyList(raw)) {
      if (!graph) {
        graph = buildGraph(raw as Record<string, unknown>);
      }

    } else if (isHashLike(raw)) {
      if (!hashmap) {
        const entries = Object.entries(raw as Record<string, unknown>)
          .slice(0, 40)
          .map(([k, v]) => ({ key: k, value: String(v) }));
        if (entries.length > 0) hashmap = { entries };
      }

    } else {
      scalars[name] = raw;
    }
  }

  // ── Pass 2: attach pointer labels to arrays ────────────────────────────────
  if (arrays.length > 0) {
    const primary = arrays.reduce((a, b) => a.data.length >= b.data.length ? a : b);
    const n = primary.data.length;

    for (const [name, value] of Object.entries(scalars)) {
      const lname = name.toLowerCase();
      if (
        typeof value === 'number' && Number.isInteger(value) &&
        value >= 0 && value < n && POINTER_NAMES.has(lname)
      ) {
        const style = POINTER_STYLE[lname] ?? { highlight: 'current' as const, color: '#94a3b8' };
        primary.pointers!.push({ index: value, label: name, color: style.color });
        primary.highlights.push({ index: value, color: style.highlight });
      }
    }
  }

  // ── Pass 3: attach pointer labels to linked list ───────────────────────────
  if (linkedList) {
    const pointers: LinkedListState['pointers'] = [];
    for (const [name, value] of Object.entries(scalars)) {
      const lname = name.toLowerCase();
      if (typeof value === 'number' && Number.isInteger(value) &&
          value >= 0 && value < linkedList.nodes.length &&
          POINTER_NAMES.has(lname)) {
        const style = POINTER_STYLE[lname] ?? { color: '#94a3b8' };
        pointers.push({ index: value, label: name, color: style.color });
      }
    }
    if (pointers.length > 0) linkedList.pointers = pointers;
  }

  // ── Pass 4: highlight graph nodes named in scalars ─────────────────────────
  if (graph) {
    const highlights: Record<string, HighlightColor> = {};
    for (const [, value] of Object.entries(scalars)) {
      if ((typeof value === 'string' || typeof value === 'number') &&
           graph.nodes.includes(String(value))) {
        highlights[String(value)] = 'current';
      }
    }
    if (Object.keys(highlights).length > 0) graph.nodeHighlights = highlights;
  }

  // ── Build partial frame ────────────────────────────────────────────────────
  const frame: Partial<Frame> = {};
  if (Object.keys(scalars).length > 0) frame.variables = scalars;
  if (tree)                              frame.tree = tree;
  if (linkedList)                        frame.linkedList = linkedList;
  if (matrix)                            frame.matrix = matrix;
  if (arrays.length > 0)                 frame.arrays = arrays;
  // Show hashmap alongside arrays if both exist; otherwise only when no other structure
  if (hashmap && !tree && !linkedList && !graph) frame.hashmap = hashmap;
  if (hashmap && arrays.length > 0)      frame.hashmap = hashmap;
  if (graph)                             frame.graph = graph;

  return frame;
}
