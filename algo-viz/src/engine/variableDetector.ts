/**
 * Inspects a snapshot of runtime variable values and maps them to the
 * appropriate Frame data-structure fields for visualization.
 *
 * Detection priority:
 *   2-D numeric array  → MatrixState
 *   1-D primitive array → ArrayState   (+ pointer detection for named indices)
 *   Object/Map        → HashMapState
 *   Scalar (number, string) → variables panel only
 *
 * Pointer heuristic: if a numeric variable's name matches the canonical
 * list of index/pointer names AND its value is a valid index into an array
 * that is also in scope, it is rendered as a pointer label on that array.
 */

import type {
  Frame,
  ArrayState,
  MatrixState,
  HashMapState,
  HighlightColor,
} from '../types';

// ─── Internal snapshot type ────────────────────────────────────────────────────
export type VarSnapshot = Record<string, unknown>;

// Variable names we treat as array index pointers
const POINTER_NAMES = new Set([
  'i','j','k','l','r','m','n',
  'lo','hi','low','high',
  'left','right','mid','middle',
  'start','end','ptr','idx','index','pos','cur','curr','head','tail',
  'slow','fast','top','bot','bottom',
]);

const POINTER_COLORS: Record<string, { label: HighlightColor; arrow: string }> = {
  lo:    { label: 'left',     arrow: '#22c55e' },
  low:   { label: 'left',     arrow: '#22c55e' },
  left:  { label: 'left',     arrow: '#22c55e' },
  l:     { label: 'left',     arrow: '#22c55e' },
  hi:    { label: 'right',    arrow: '#ef4444' },
  high:  { label: 'right',    arrow: '#ef4444' },
  right: { label: 'right',    arrow: '#ef4444' },
  r:     { label: 'right',    arrow: '#ef4444' },
  mid:   { label: 'mid',      arrow: '#eab308' },
  middle:{ label: 'mid',      arrow: '#eab308' },
  m:     { label: 'mid',      arrow: '#eab308' },
  i:     { label: 'current',  arrow: '#3b82f6' },
  j:     { label: 'comparing',arrow: '#a855f7' },
  k:     { label: 'current',  arrow: '#3b82f6' },
  slow:  { label: 'head',     arrow: '#06b6d4' },
  fast:  { label: 'tail',     arrow: '#f97316' },
  head:  { label: 'head',     arrow: '#06b6d4' },
  tail:  { label: 'tail',     arrow: '#f97316' },
};

// Deep-clone a value for safe snapshotting (limit depth/size)
export function safeClone(value: unknown, depth = 0): unknown {
  if (depth > 4) return '…';
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    if (value.length > 200) return value.slice(0, 200).map(v => safeClone(v, depth + 1));
    return value.map(v => safeClone(v, depth + 1));
  }
  const obj: Record<string, unknown> = {};
  let count = 0;
  for (const [k, v] of Object.entries(value as object)) {
    if (count++ > 50) { obj['…'] = '(truncated)'; break; }
    obj[k] = safeClone(v, depth + 1);
  }
  return obj;
}

// Check if a value looks like a 1-D array of primitives
function isPrimitiveArray(v: unknown): v is (number | string | null)[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    !Array.isArray(v[0]) &&
    v.every(el => el === null || typeof el === 'number' || typeof el === 'string' || typeof el === 'boolean')
  );
}

// Check if a value looks like a 2-D numeric/string array (matrix)
function isMatrix(v: unknown): v is (number | string)[][] {
  if (!Array.isArray(v) || v.length === 0) return false;
  const first = v[0];
  if (!Array.isArray(first) || first.length === 0) return false;
  return v.every(row => Array.isArray(row));
}

// Check if a value is a plain object we can show as a hashmap
function isHashLike(v: unknown): v is Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  // Must have at least one entry
  return Object.keys(v as object).length > 0;
}

/** Convert a runtime variable snapshot into Frame fields. */
export function detectVisualization(vars: VarSnapshot): Partial<Frame> {
  const arrays: ArrayState[] = [];
  const scalars: Record<string, unknown> = {};
  let matrix: MatrixState | undefined;
  let hashmap: HashMapState | undefined;

  // ── 1. Classify each variable ──────────────────────────────────────────────
  for (const [name, raw] of Object.entries(vars)) {
    // Skip internal helpers
    if (name.startsWith('__') || typeof raw === 'function') continue;

    if (isMatrix(raw)) {
      // Prefer the first matrix we find
      if (!matrix) {
        matrix = {
          data: raw as (number | string)[][],
          highlights: [],
          visitedCells: undefined,
          pathCells: undefined,
        };
      }
    } else if (isPrimitiveArray(raw)) {
      arrays.push({
        id: name,
        label: name,
        data: raw,
        highlights: [],
        pointers: [],
      });
    } else if (isHashLike(raw)) {
      // Only use the first hash-like value for the hashmap panel
      if (!hashmap) {
        const entries = Object.entries(raw as Record<string, unknown>)
          .slice(0, 30)
          .map(([k, v]) => ({
            key: k,
            value: String(v),
          }));
        if (entries.length > 0) {
          hashmap = { entries };
        }
      }
    } else {
      scalars[name] = raw;
    }
  }

  // ── 2. Attach pointer labels to arrays ─────────────────────────────────────
  // For every numeric scalar that looks like an index pointer, attach it to
  // the first (largest) array in scope.
  if (arrays.length > 0) {
    // Sort by size descending so we prefer the main array
    const primaryArray = arrays.reduce((a, b) => (a.data.length >= b.data.length ? a : b));
    const n = primaryArray.data.length;

    for (const [name, value] of Object.entries(scalars)) {
      if (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 0 &&
        value < n &&
        POINTER_NAMES.has(name.toLowerCase())
      ) {
        const colorDef = POINTER_COLORS[name.toLowerCase()];
        primaryArray.pointers!.push({
          index: value,
          label: name,
          color: colorDef?.arrow ?? '#94a3b8',
        });
        primaryArray.highlights.push({
          index: value,
          color: colorDef?.label ?? 'current',
        });
      }
    }
  }

  // ── 3. Build the partial frame ─────────────────────────────────────────────
  const frame: Partial<Frame> = {};
  if (Object.keys(scalars).length > 0) frame.variables = scalars;
  if (arrays.length > 0) frame.arrays = arrays;
  if (matrix) frame.matrix = matrix;
  if (hashmap && !arrays.length && !matrix) frame.hashmap = hashmap;
  // Show hashmap alongside arrays if both exist
  if (hashmap && arrays.length > 0) frame.hashmap = hashmap;

  return frame;
}
