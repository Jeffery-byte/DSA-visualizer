/**
 * Python execution engine via Pyodide (CPython compiled to WebAssembly).
 *
 * Pyodide is loaded lazily from CDN on the first Python run (~12 MB).
 * After that, the WASM module is cached in the module's closure.
 *
 * Execution uses Python's sys.settrace() to intercept every line event
 * and capture local variable snapshots, which are then converted to Frames
 * by the variable detector.
 */

import type { Frame } from '../types';
import { detectVisualization, safeClone } from './variableDetector';

// ─── Pyodide type stub ────────────────────────────────────────────────────────
interface PyodideInstance {
  runPythonAsync(code: string): Promise<unknown>;
  globals: { get(key: string): unknown };
  toPy(obj: unknown): unknown;
}

declare global {
  function loadPyodide(options?: { indexURL?: string }): Promise<PyodideInstance>;
}

// ─── Singleton Pyodide instance ───────────────────────────────────────────────
let pyodideInstance: PyodideInstance | null = null;
let loadingPromise: Promise<PyodideInstance> | null = null;

async function getPyodide(): Promise<PyodideInstance> {
  if (pyodideInstance) return pyodideInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    // Inject the Pyodide loader script into the document if not already present
    if (typeof loadPyodide === 'undefined') {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Pyodide from CDN'));
        document.head.appendChild(script);
      });
    }

    const py = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/',
    });

    pyodideInstance = py;
    return py;
  })();

  return loadingPromise;
}

// ─── Python tracer code (runs inside Pyodide) ─────────────────────────────────
// We use sys.settrace to intercept each line event.  The tracer serializes
// local variables as a JSON string so we can pass them back to JavaScript.

const TRACER_SETUP = `
import sys
import json
import traceback

_steps = []
_step_limit = 2000

class _StepLimitError(Exception):
    pass

def _make_tracer(user_globals):
    def _tracer(frame, event, arg):
        if event != 'line':
            return _tracer
        if len(_steps) >= _step_limit:
            raise _StepLimitError(f"Step limit of {_step_limit} reached – possible infinite loop.")
        
        # Only trace frames in the user's module (not builtins)
        if frame.f_code.co_filename != '<user_code>':
            return _tracer
        
        local_vars = {}
        for k, v in frame.f_locals.items():
            if k.startswith('_'):
                continue
            try:
                if isinstance(v, (int, float, str, bool, type(None))):
                    local_vars[k] = v
                elif isinstance(v, list):
                    if len(v) <= 200:
                        local_vars[k] = v
                elif isinstance(v, dict):
                    if len(v) <= 50:
                        local_vars[k] = {str(k2): str(v2) for k2, v2 in list(v.items())[:30]}
                elif isinstance(v, set):
                    local_vars[k] = list(v)[:30]
                else:
                    local_vars[k] = str(v)
            except Exception:
                pass
        
        try:
            _steps.append({
                'line': frame.f_lineno,
                'vars': json.dumps(local_vars, default=str)
            })
        except Exception:
            pass
        
        return _tracer
    return _tracer
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
  // ── 1. Load Pyodide ──────────────────────────────────────────────────────
  let py: PyodideInstance;
  try {
    onLoadStateChange?.('loading');
    py = await getPyodide();
    onLoadStateChange?.('ready');
  } catch (err) {
    onLoadStateChange?.('error');
    return {
      frames: [],
      error: `Failed to load Python runtime: ${(err as Error).message}`,
    };
  }

  // ── 2. Set up tracer + execute user code ─────────────────────────────────
  try {
    // Install the tracer infrastructure
    await py.runPythonAsync(TRACER_SETUP);

    // Wrap user code to use the tracer
    const wrappedCode = `
_steps.clear()

# Compile user code with a recognisable filename so the tracer can filter it
import types as _types
_user_code = compile(${JSON.stringify(code)}, '<user_code>', 'exec')
_user_globals = {}
sys.settrace(_make_tracer(_user_globals))
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

    // ── 3. Retrieve steps ──────────────────────────────────────────────────
    const rawSteps = py.globals.get('_steps') as { toJs: () => Array<{ line: number; vars: string }> };
    const stepError = py.globals.get('_step_error') as string | undefined;
    const execError = py.globals.get('_exec_error') as string | undefined;

    let stepList: Array<{ line: number; vars: string }> = [];
    try {
      // Pyodide returns Python objects; .toJs() converts to JS
      stepList = (rawSteps as unknown as { toJs: () => unknown }).toJs() as Array<{ line: number; vars: string }>;
    } catch {
      stepList = [];
    }

    // ── 4. Convert steps to Frames ─────────────────────────────────────────
    const frames: Frame[] = stepList.map(step => {
      let vars: Record<string, unknown> = {};
      try {
        vars = JSON.parse(step.vars) as Record<string, unknown>;
      } catch { /* ignore */ }

      const snapped: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(vars)) {
        try { snapped[k] = safeClone(v); }
        catch { snapped[k] = String(v); }
      }

      const vizFields = detectVisualization(snapped);
      return {
        line: step.line,
        description: buildPythonDescription(step.line, snapped),
        ...vizFields,
      };
    });

    const errorMsg = stepError ?? execError;

    if (frames.length === 0 && !errorMsg) {
      return {
        frames: [],
        error: 'No steps captured. Make sure your code contains function calls and variable assignments.',
      };
    }

    return {
      frames,
      error: errorMsg ? `Runtime error: ${errorMsg}` : undefined,
    };
  } catch (err) {
    return {
      frames: [],
      error: `Execution error: ${(err as Error).message}`,
    };
  }
}

function buildPythonDescription(lineNum: number, vars: Record<string, unknown>): string {
  const scalars = Object.entries(vars)
    .filter(([, v]) => typeof v !== 'object' || v === null)
    .slice(0, 4)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(', ');
  return `Line ${lineNum}${scalars ? `  ·  ${scalars}` : ''}`;
}

/** Whether Pyodide is already loaded (used by UI to show correct loading text). */
export function isPyodideReady(): boolean {
  return pyodideInstance !== null;
}
