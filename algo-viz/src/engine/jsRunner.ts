/**
 * JavaScript / TypeScript execution engine.
 *
 * Babel standalone is loaded lazily (dynamic import) — only downloaded when
 * Custom mode is first opened (~3 MB gzip, cached after first load).
 *
 * Pipeline:
 *   1. Babel parse + plugin transforms the AST:
 *      a. __push__(funcName, args) at every function entry
 *      b. __pop__() in a try/finally around every function body
 *         (guarantees the frame is popped even on exception or implicit return)
 *      c. __step__(line, vars) after every key statement
 *   2. Instrumented code runs via new Function(); the three injected helpers
 *      accumulate frames with full call-stack snapshots.
 *   3. detectVisualization() maps each var snapshot to the right viz type.
 *
 * Safety: STEP_LIMIT prevents infinite loops; new Function() gives an isolated
 * scope with no access to the module's own variables.
 */

import type { Frame, CallStackFrame } from '../types';
import { detectVisualization, safeClone, resetTreeIds } from './variableDetector';

const STEP_LIMIT = 3000;

// ─── Lazy Babel singleton ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let babelCache: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getBabel(): Promise<any> {
  if (!babelCache) babelCache = await import('@babel/standalone');
  return babelCache;
}

// ─── Babel plugin ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makePlugin({ types: t }: { types: any }) {
  const done = new WeakSet();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function scopeVars(scope: any): string[] {
    const names: string[] = [];
    let s = scope;
    while (s) {
      if (s.bindings) names.push(...Object.keys(s.bindings));
      s = s.parent ?? null;
      if (!s?.parent) break;
    }
    return [...new Set(names)].filter(
      n => !n.startsWith('_') && n !== '__step__' && n !== '__push__' && n !== '__pop__'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ln = (node: any): number => node?.loc?.start?.line ?? 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mkStep(line: number, vars: string[]): any {
    const node = t.expressionStatement(
      t.callExpression(t.identifier('__step__'), [
        t.numericLiteral(line),
        t.objectExpression(
          vars.map((n: string) =>
            t.objectProperty(t.identifier(n), t.identifier(n), false, true)
          )
        ),
      ])
    );
    done.add(node);
    return node;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mkPush(funcName: string, line: number, params: string[]): any {
    const node = t.expressionStatement(
      t.callExpression(t.identifier('__push__'), [
        t.stringLiteral(funcName),
        t.numericLiteral(line),
        t.objectExpression(
          params.map((n: string) =>
            t.objectProperty(t.identifier(n), t.identifier(n), false, true)
          )
        ),
      ])
    );
    done.add(node);
    return node;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mkPop(): any {
    const node = t.expressionStatement(
      t.callExpression(t.identifier('__pop__'), [])
    );
    done.add(node);
    return node;
  }

  return {
    visitor: {
      // ── Function: wrap body with __push__ entry + try/finally __pop__ exit ──
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': {
        // Use exit so inner statements already have __step__ injected before we wrap
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exit(path: any) {
          if (done.has(path.node)) return;
          done.add(path.node);

          const body = path.node.body;
          if (!body?.body) return; // expression arrow — skip

          // Resolve function name
          const funcName: string =
            path.node.id?.name ??
            path.parent?.id?.name ??
            path.parent?.key?.name ??
            'anonymous';

          const params: string[] = (path.node.params ?? [])
            .filter((p: { type: string }) => p.type === 'Identifier')
            .map((p: { name: string }) => p.name);

          const pushNode = mkPush(funcName, ln(path.node), params);
          const popNode  = mkPop();

          // Wrap the existing body in try/finally
          const tryStmt = t.tryStatement(
            t.blockStatement([...body.body]),
            null,
            t.blockStatement([popNode])
          );
          done.add(tryStmt);
          done.add(popNode);

          body.body = [pushNode, tryStmt];
        },
      },

      // ── Variable declarations ──────────────────────────────────────────────
      VariableDeclaration: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exit(path: any) {
          if (done.has(path.node)) return;
          done.add(path.node);
          const pp = path.parentPath;
          if (pp?.isForStatement?.() || pp?.isForOfStatement?.() || pp?.isForInStatement?.()) return;
          const declared: string[] = (path.node.declarations ?? [])
            .filter((d: { id: { type: string } }) => d.id.type === 'Identifier')
            .map((d: { id: { name: string } }) => d.id.name);
          path.insertAfter(mkStep(ln(path.node), [...new Set([...declared, ...scopeVars(path.scope)])]));
        },
      },

      // ── Expression statements (assignments, .push(), etc.) ─────────────────
      ExpressionStatement: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exit(path: any) {
          if (done.has(path.node)) return;
          done.add(path.node);
          const pp = path.parentPath;
          if (pp?.isForStatement?.() || pp?.isForOfStatement?.() || pp?.isForInStatement?.()) return;
          path.insertAfter(mkStep(ln(path.node), scopeVars(path.scope)));
        },
      },

      // ── Return statements ──────────────────────────────────────────────────
      ReturnStatement: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter(path: any) {
          if (done.has(path.node)) return;
          done.add(path.node);
          path.insertBefore(mkStep(ln(path.node), scopeVars(path.scope)));
          // __pop__ is handled by the try/finally; don't double-insert here
        },
      },
    },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────
export interface RunResult {
  frames: Frame[];
  error?: string;
}

export async function runJavaScript(code: string, isTypeScript = false): Promise<RunResult> {
  const Babel = await getBabel();

  // ── 1. Transform ────────────────────────────────────────────────────────────
  let instrumented: string;
  try {
    const result = Babel.transform(code, {
      presets:    isTypeScript ? ['typescript'] : [],
      plugins:    [makePlugin as never],
      filename:   isTypeScript ? 'user.ts' : 'user.js',
      parserOpts: { strictMode: false },
    });
    instrumented = result.code ?? '';
  } catch (err) {
    return { frames: [], error: `Parse error: ${(err as Error).message}` };
  }

  // ── 2. Execute ──────────────────────────────────────────────────────────────
  resetTreeIds();
  const frames:    Frame[]            = [];
  const callStack: CallStackFrame[]   = [];
  let   depth                         = 0;
  let   frameSeq                      = 0;
  let   stepCount                     = 0;

  function __push__(funcName: string, _line: number, args: Record<string, unknown>) {
    callStack.push({
      id:       `${funcName}-${frameSeq++}`,
      funcName,
      args:     safeClone(args) as Record<string, unknown>,
      isActive: true,
      depth:    depth++,
    });
  }

  function __pop__() {
    depth = Math.max(0, depth - 1);
    const top = callStack[callStack.length - 1];
    if (top) {
      top.isActive = false;
      callStack.pop();
    }
  }

  function __step__(lineNum: number, vars: Record<string, unknown>) {
    if (++stepCount > STEP_LIMIT) {
      throw new Error(`Step limit of ${STEP_LIMIT} reached — possible infinite loop.`);
    }

    const snapped: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(vars)) {
      try { snapped[k] = safeClone(v); } catch { snapped[k] = String(v); }
    }

    const vizFields = detectVisualization(snapped);

    frames.push({
      line:        lineNum,
      description: buildDesc(lineNum, snapped),
      callStack:   callStack.length > 0
        ? callStack.map(f => ({ ...f }))
        : undefined,
      ...vizFields,
    });
  }

  try {
    new Function('__step__', '__push__', '__pop__', instrumented)(__step__, __push__, __pop__);
  } catch (err) {
    const msg = (err as Error).message;
    return { frames, error: msg.includes('Step limit') ? msg : `Runtime error: ${msg}` };
  }

  if (frames.length === 0) {
    return { frames: [], error: 'No steps captured — call your function and use variables.' };
  }
  return { frames };
}

function buildDesc(line: number, vars: Record<string, unknown>): string {
  const scalars = Object.entries(vars)
    .filter(([, v]) => v === null || typeof v !== 'object')
    .slice(0, 4)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(', ');
  return `Line ${line}${scalars ? `  ·  ${scalars}` : ''}`;
}
