import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, AlertTriangle, CheckCircle, Loader,
  Clock, Database, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useStore } from '../../store';
import VisualizationPanel from '../viz/VisualizationPanel';
import PlaybackControls from '../layout/PlaybackControls';
import { runJavaScript } from '../../engine/jsRunner';
import { runPython, isPyodideReady } from '../../engine/pythonRunner';
import { analyzeComplexity } from '../../engine/complexityAnalyzer';
import type { Complexity, Language } from '../../types';

type CustomLang = Exclude<Language, 'c'>;

interface LangConfig {
  label: string;
  monacoLang: string;
  color: string;
  canRun: boolean;
}

const LANG_CONFIG: Record<CustomLang, LangConfig> = {
  javascript: { label: 'JavaScript', monacoLang: 'javascript', color: '#f7df1e', canRun: true  },
  typescript: { label: 'TypeScript', monacoLang: 'typescript', color: '#3178c6', canRun: true  },
  python:     { label: 'Python',     monacoLang: 'python',     color: '#3572a5', canRun: true  },
  java:       { label: 'Java',       monacoLang: 'java',       color: '#b07219', canRun: false },
};

const STARTER: Record<CustomLang, string> = {
  javascript: `// Write any algorithm and click "Run & Visualize"
// Arrays, pointer variables (lo, hi, mid, i, j), hash maps,
// trees {val, left, right}, linked lists {val, next}, and
// adjacency lists {node: [neighbors]} are all detected automatically.

function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

const result = binarySearch([1, 3, 5, 7, 9, 11, 13, 15], 9);
`,
  typescript: `// TypeScript — type annotations are stripped before execution

function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

bubbleSort([5, 3, 8, 1, 9, 2, 7, 4]);
`,
  python: `# Write any Python algorithm and click "Run & Visualize"
# Variables named lo, hi, mid, i, j are shown as array pointers.

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

result = two_sum([2, 7, 11, 15], 9)
`,
  java: `// Java — complexity analysis only (no in-browser JVM).
// Paste your method below to analyse time & space complexity.

public static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[]{ map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    return new int[]{};
}
`,
};

function complexityColor(n: string): string {
  if (/O\(1\)|O\(log/.test(n))        return '#22c55e';
  if (/O\(n\)|O\(k\)|O\(h\)/.test(n)) return '#eab308';
  if (/O\(n.log|O\(n.k/.test(n))      return '#f97316';
  return '#ef4444';
}

export default function CustomCodePage() {
  const { frames, currentFrameIndex, setCustomFrames } = useStore();
  const currentFrame = frames[currentFrameIndex] ?? null;

  const [lang, setLang]               = useState<CustomLang>('javascript');
  const [code, setCode]               = useState(STARTER.javascript);
  const [status, setStatus]           = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg]       = useState('');
  const [complexity, setComplexity]   = useState<Complexity | null>(null);
  const [complexityOpen, setComplexityOpen] = useState(true);
  const [pyLoading, setPyLoading]     = useState(false);

  const handleLangChange = useCallback((next: CustomLang) => {
    setLang(next);
    setCode(STARTER[next]);
    setStatus('idle');
    setErrorMsg('');
    setComplexity(null);
  }, []);

  const handleRun = useCallback(async () => {
    if (status === 'running') return;
    const trimmed = code.trim();
    if (!trimmed) return;

    setStatus('running');
    setErrorMsg('');
    setComplexity(analyzeComplexity(trimmed));
    setComplexityOpen(true);

    const cfg = LANG_CONFIG[lang];
    if (!cfg.canRun) {
      setStatus('done');
      setCustomFrames([]);
      return;
    }

    try {
      let result;
      if (lang === 'python') {
        setPyLoading(!isPyodideReady());
        result = await runPython(trimmed, state => { if (state === 'ready') setPyLoading(false); });
        setPyLoading(false);
      } else {
        result = await runJavaScript(trimmed, lang === 'typescript');
      }
      setCustomFrames(result.frames);
      setStatus(result.error ? 'error' : 'done');
      if (result.error) setErrorMsg(result.error);
    } catch (err) {
      setStatus('error');
      setErrorMsg(`Unexpected error: ${(err as Error).message}`);
    }
  }, [code, lang, status, setCustomFrames]);

  const cfg = LANG_CONFIG[lang];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ── Editor panel ──────────────────────────────────────────────── */}
        <div className="flex flex-col border-r border-slate-800 bg-slate-950" style={{ width: '52%', minWidth: 340 }}>

          {/* Language tabs */}
          <div
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900"
            role="tablist"
            aria-label="Programming language"
          >
            {(Object.keys(LANG_CONFIG) as CustomLang[]).map(l => (
              <button
                key={l}
                role="tab"
                aria-selected={lang === l}
                onClick={() => handleLangChange(l)}
                className={`px-4 py-2 rounded-xl text-sm font-mono font-semibold transition-all ${
                  lang === l ? 'text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700/60'
                }`}
                style={lang === l ? { backgroundColor: LANG_CONFIG[l].color } : {}}
              >
                {LANG_CONFIG[l].label}
              </button>
            ))}
          </div>

          {/* Monaco editor */}
          <div className="flex-1 min-h-0">
            <Editor
              language={cfg.monacoLang}
              value={code}
              onChange={v => setCode(v ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                lineHeight: 22,
                fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
                fontLigatures: true,
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                bracketPairColorization: { enabled: true },
                renderLineHighlight: 'line',
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Run bar */}
          <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900 px-5 py-4 flex items-center gap-4 flex-wrap">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleRun}
              disabled={status === 'running'}
              aria-label="Run and visualize code"
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-base transition-all flex-shrink-0 ${
                status === 'running'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-900/30'
              }`}
            >
              {status === 'running'
                ? <Loader size={16} className="animate-spin" />
                : <Play   size={16} fill="white" />}
              {status === 'running'
                ? (pyLoading ? 'Loading Python…' : 'Running…')
                : cfg.canRun ? 'Run & Visualize' : 'Analyse Complexity'}
            </motion.button>

            <AnimatePresence mode="wait">
              {status === 'done' && !errorMsg && cfg.canRun && (
                <motion.span key="ok"
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-emerald-400 text-sm font-mono">
                  <CheckCircle size={15} />
                  {frames.length} step{frames.length !== 1 ? 's' : ''} captured
                </motion.span>
              )}
              {status === 'done' && !cfg.canRun && (
                <motion.span key="java-ok"
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="text-sm text-slate-400 font-mono">
                  Analysis complete
                </motion.span>
              )}
              {(status === 'error' || (status !== 'idle' && errorMsg)) && (
                <motion.span key="err"
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-amber-400 text-sm font-mono max-w-xs truncate"
                  title={errorMsg}>
                  <AlertTriangle size={15} />
                  {errorMsg}
                </motion.span>
              )}
            </AnimatePresence>

            {lang === 'java' && status === 'idle' && (
              <span className="text-sm text-slate-500 font-mono">
                Java: complexity analysis only
              </span>
            )}
          </div>
        </div>

        {/* ── Visualization + Complexity ────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-950">

          {/* Viz panel */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)', backgroundSize: '28px 28px' }}
            />
            {(status === 'idle' || !currentFrame) ? (
              <div className="h-full flex flex-col items-center justify-center gap-5 text-center px-10">
                <div className="text-6xl opacity-20">⚡</div>
                <p className="text-slate-400 text-lg font-medium">
                  Write your code and click <span className="text-blue-400 font-semibold">Run & Visualize</span>
                </p>
                <p className="text-slate-600 text-sm max-w-sm leading-relaxed">
                  Arrays, 2-D grids, hash maps, trees, linked lists, graphs, and recursive call stacks
                  are all detected and visualized automatically.
                </p>
              </div>
            ) : (
              <VisualizationPanel frame={currentFrame} />
            )}
          </div>

          {/* Complexity card */}
          {complexity && (
            <div key={lang} className="flex-shrink-0 border-t border-slate-800 bg-slate-900">
              <button
                onClick={() => setComplexityOpen(o => !o)}
                aria-expanded={complexityOpen}
                aria-controls="cplx-panel"
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <span aria-hidden="true" className="text-slate-500">⏱</span>
                  Complexity Analysis
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold" style={{ color: complexityColor(complexity.time) }}>
                    Time {complexity.time}
                  </span>
                  <span className="font-mono text-sm font-bold" style={{ color: complexityColor(complexity.space) }}>
                    Space {complexity.space}
                  </span>
                  {complexityOpen
                    ? <ChevronDown size={14} className="text-slate-500" />
                    : <ChevronUp   size={14} className="text-slate-500" />}
                </div>
              </button>

              <AnimatePresence>
                {complexityOpen && (
                  <motion.div
                    id="cplx-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1 rounded-xl p-3.5 bg-slate-950 border border-slate-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={13} className="text-slate-500" aria-hidden="true" />
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Time Complexity</span>
                          </div>
                          <span className="font-mono font-bold text-xl" style={{ color: complexityColor(complexity.time) }}>
                            {complexity.time}
                          </span>
                        </div>
                        <div className="flex-1 rounded-xl p-3.5 bg-slate-950 border border-slate-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Database size={13} className="text-slate-500" aria-hidden="true" />
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Space Complexity</span>
                          </div>
                          <span className="font-mono font-bold text-xl" style={{ color: complexityColor(complexity.space) }}>
                            {complexity.space}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl p-4 bg-slate-950 border border-slate-800 max-h-40 overflow-y-auto">
                        {complexity.reasoning.split('\n\n').map((para, i) => (
                          <p key={i} className={`text-sm text-slate-400 leading-relaxed ${i > 0 ? 'mt-2.5' : ''}`}>
                            {para.replace(/\*\*([^*]+)\*\*/g, '$1')}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <PlaybackControls />
    </div>
  );
}
