/**
 * Python execution engine via Pyodide (CPython compiled to WebAssembly).
 *
 * Pyodide is loaded lazily from CDN the first time Python is run.
 * sys.settrace() intercepts every line, call, and return event so we can
 * build a full call-stack alongside the variable snapshot at each step.
 */

import type { Frame, CallStackFrame } from '../types';
import { detectVisualization, safeClone, resetTreeIds } from './variableDetector';

interface PyodideInstance {
  runPythonAsync(code: string): Promise<unknown>;
  globals: { get(key: string): unknown };
}

declare global {
  function loadPyodide(options?: { indexURL?: string }): Promise<PyodideInstance>;
}

let pyodideInstance: PyodideInstance | null = null;
let loadingPromise: Promise<PyodideInstance> | null = null;

async function getPyodide(): Promise<PyodideInstance> {
  if (pyodideInstance) return pyodideInstance;
  if (loadingPromise)  return loadingPromise;

  loadingPromise = (async () => {
    if (typeof loadPyodide === 'undefined') {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js';
        script.onload  = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Pyodide from CDN'));
        document.head.appendChild(script);
      });
    }
    const py = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/' });
    pyodideInstance = py;
    return py;
  })();

  return loadingPromise;
}

// ─── Python tracer (runs inside Pyodide) ─────────────────────────────────────
const TRACER_SETUP = `
import sys, json, traceback

_steps = []
_call_stack = []
_step_limit = 2000
_step_error = None

class _StepLimitError(Exception):
    pass

def _make_tracer():
    def _tracer(frame, event, arg):
        global _step_error
        if frame.f_code.co_filename != '<user_code>':
            return _tracer

        # ── Call event: push to call stack ────────────────────────────────
        if event == 'call':
            params = {k: v for k, v in frame.f_locals.items() if not k.startswith('_')}
            _call_stack.append({
                'id':       f"{frame.f_code.co_name}-{len(_steps)}",
                'funcName': frame.f_code.co_name,
                'args':     json.dumps(params, default=str),
                'depth':    len(_call_stack),
                'isActive': True,
            })
            return _tracer

        # ── Return event: pop from call stack ─────────────────────────────
        if event == 'return':
            if _call_stack:
                _call_stack[-1]['returnValue'] = json.dumps(arg, default=str)
                _call_stack[-1]['isActive'] = False
                _call_stack.pop()
            return _tracer

        # ── Line event: capture variable snapshot ─────────────────────────
        if event != 'line':
            return _tracer

        if len(_steps) >= _step_limit:
            raise _StepLimitError(f"Step limit of {_step_limit} reached — possible infinite loop.")

        local_vars = {}
        for k, v in frame.f_locals.items():
            if k.startswith('_'):
                continue
            try:
                if isinstance(v, (int, float, str, bool, type(None))):
                    local_vars[k] = v
                elif isinstance(v, list):
                    if len(v) <= 300:
                        local_vars[k] = v
                elif isinstance(v, dict):
                    if len(v) <= 60:
                        local_vars[k] = {str(k2): str(v2) for k2, v2 in list(v.items())[:40]}
                elif isinstance(v, set):
                    local_vars[k] = list(v)[:30]
                elif hasattr(v, '__dict__') and hasattr(v, 'val') or hasattr(v, 'value'):
                    # Tree/linked-list node — serialize as dict
                    local_vars[k] = _serialize_node(v, set())
                else:
                    local_vars[k] = str(v)
            except Exception:
                pass

        _steps.append({
            'line':  frame.f_lineno,
            'vars':  json.dumps(local_vars, default=str),
            'stack': json.dumps(list(_call_stack)),
        })
        return _tracer
    return _tracer

def _serialize_node(node, seen, depth=0):
    """Recursively serialize tree/linked-list nodes to dicts."""
    if node is None or depth > 20:
        return None
    node_id = id(node)
    if node_id in seen:
        return None   # cycle guard
    seen = seen | {node_id}
    d = {}
    # Standard val fields
    for attr in ('val', 'value', 'data', 'key'):
        if hasattr(node, attr):
            d[attr] = getattr(node, attr)
            break
    # Tree children
    for attr in ('left', 'right', 'next', 'children'):
        if hasattr(node, attr):
            child = getattr(node, attr)
            if child is None:
                d[attr] = None
            elif isinstance(child, list):
                d[attr] = [_serialize_node(c, seen, depth+1) for c in child]
            else:
                d[attr] = _serialize_node(child, seen, depth+1)
    return d
`;

// ─── Public API ───────────────────────────────────────────────────────────────
export interface PyRunResult {
  frames: Frame[];
  error?: string;
}

export type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export async function runPython(
  code: string,
  onLoadStateChange?: (state: LoadState) => void,
): Promise<PyRunResult> {
  let py: PyodideInstance;
  try {
    onLoadStateChange?.('loading');
    py = await getPyodide();
    onLoadStateChange?.('ready');
  } catch (err) {
    onLoadStateChange?.('error');
    return { frames: [], error: `Failed to load Python runtime: ${(err as Error).message}` };
  }

  try {
    await py.runPythonAsync(TRACER_SETUP);

    const wrappedCode = `
_steps.clear()
_call_stack.clear()
_step_error = None

import types as _types
_user_code = compile(${JSON.stringify(code)}, '<user_code>', 'exec')
_user_globals = {}
sys.settrace(_make_tracer())
try:
    exec(_user_code, _user_globals)
except _StepLimitError as e:
    _step_error = str(e)
except Exception as e:
    _exec_error = str(e)
finally:
    sys.settrace(None)
`;
    await py.runPythonAsync(wrappedCode);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawSteps  = (py.globals.get('_steps')  as any).toJs() as
      Array<{ line: number; vars: string; stack: string }>;
    const stepError = py.globals.get('_step_error') as string | null;
    const execError = py.globals.get('_exec_error') as string | null;

    resetTreeIds();

    const frames: Frame[] = (rawSteps ?? []).map(step => {
      let vars:      Record<string, unknown> = {};
      let stackData: Array<Record<string, unknown>> = [];

      try { vars      = JSON.parse(step.vars)  as Record<string, unknown>; } catch { /**/ }
      try { stackData = JSON.parse(step.stack) as Array<Record<string, unknown>>; } catch { /**/ }

      const snapped: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(vars)) {
        try { snapped[k] = safeClone(v); } catch { snapped[k] = String(v); }
      }

      const callStack: CallStackFrame[] = stackData.map((f, idx) => ({
        id:          String(f.id   ?? `${f.funcName}-${idx}`),
        funcName:    String(f.funcName ?? 'unknown'),
        args:        JSON.parse(String(f.args ?? '{}')),
        returnValue: f.returnValue !== undefined ? JSON.parse(String(f.returnValue)) : undefined,
        isActive:    Boolean(f.isActive),
        depth:       Number(f.depth ?? idx),
      }));

      const vizFields = detectVisualization(snapped);
      return {
        line:        step.line,
        description: buildPyDesc(step.line, snapped),
        callStack:   callStack.length > 0 ? callStack : undefined,
        ...vizFields,
      };
    });

    const errorMsg = stepError ?? execError ?? undefined;
    if (frames.length === 0 && !errorMsg) {
      return { frames: [], error: 'No steps captured. Make sure your code calls a function.' };
    }
    return { frames, error: errorMsg ?? undefined };

  } catch (err) {
    return { frames: [], error: `Execution error: ${(err as Error).message}` };
  }
}

function buildPyDesc(lineNum: number, vars: Record<string, unknown>): string {
  const scalars = Object.entries(vars)
    .filter(([, v]) => v === null || typeof v !== 'object')
    .slice(0, 4)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(', ');
  return `Line ${lineNum}${scalars ? `  ·  ${scalars}` : ''}`;
}

export function isPyodideReady(): boolean { return pyodideInstance !== null; }
