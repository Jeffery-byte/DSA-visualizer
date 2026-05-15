/**
 * JavaScript / TypeScript execution engine.
 *
 * Babel standalone is loaded lazily (dynamic import) so it never bloats the
 * initial bundle — it only downloads when the user first opens Custom mode.
 *
 * Pipeline:
 *   1. Lazy-load @babel/standalone (~3MB, cached after first import).
 *   2. Strip TypeScript types if needed (preset-typescript).
 *   3. Instrument AST: inject __step__(lineNum, {varSnapshot}) at key statements.
 *   4. Execute with new Function(); __step__ accumulates Frame objects.
 *   5. detectVisualization() maps each snapshot to the right viz type.
 *
 * Safety: STEP_LIMIT prevents infinite loops from hanging the tab.
 */

import type { Frame } from '../types';
import { detectVisualization, safeClone } from './variableDetector';

const STEP_LIMIT = 3000;

// ─── Lazy Babel singleton ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let babelCache: any | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getBabel(): Promise<any> {
  if (babelCache) return babelCache;
  babelCache = await import('@babel/standalone');
  return babelCache;
}

// ─── Babel instrumentation plugin ─────────────────────────────────────────────
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
    return [...new Set(names)].filter(n => !n.startsWith('_') && n !== '__step__');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mkStep(line: number, vars: string[]): any {
    const node = t.expressionStatement(
      t.callExpression(t.identifier('__step__'), [
        t.numericLiteral(line),
        t.objectExpression(
          vars.map((n: string) => t.objectProperty(t.identifier(n), t.identifier(n), false, true))
        ),
      ])
    );
    done.add(node);
    return node;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ln = (node: any): number => node?.loc?.start?.line ?? 0;

  return {
    visitor: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path: any) {
        if (done.has(path.node)) return;
        done.add(path.node);
        const params: string[] = (path.node.params ?? [])
          .filter((p: { type: string }) => p.type === 'Identifier')
          .map((p: { name: string }) => p.name);
        if (!params.length || !path.node.body?.body) return;
        path.node.body.body.unshift(mkStep(ln(path.node), params));
      },

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

      ReturnStatement: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter(path: any) {
          if (done.has(path.node)) return;
          done.add(path.node);
          path.insertBefore(mkStep(ln(path.node), scopeVars(path.scope)));
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

  // ── 1. Transform ────────────────────────────────────────────────────────
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

  // ── 2. Execute ──────────────────────────────────────────────────────────
  const frames: Frame[] = [];
  let stepCount = 0;

  function __step__(lineNum: number, vars: Record<string, unknown>) {
    if (++stepCount > STEP_LIMIT) {
      throw new Error(`Step limit of ${STEP_LIMIT} reached — possible infinite loop.`);
    }
    const snapped: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(vars)) {
      try { snapped[k] = safeClone(v); }
      catch { snapped[k] = String(v); }
    }
    frames.push({
      line: lineNum,
      description: buildDesc(lineNum, snapped),
      ...detectVisualization(snapped),
    });
  }

  try {
    new Function('__step__', instrumented)(__step__);
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
