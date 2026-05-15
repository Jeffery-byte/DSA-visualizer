import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, Database } from 'lucide-react';
import { useStore } from '../../store';
import type { Language } from '../../types';

const LANGUAGES: { id: Language; label: string; color: string }[] = [
  { id: 'javascript', label: 'JS',     color: '#f7df1e' },
  { id: 'typescript', label: 'TS',     color: '#3178c6' },
  { id: 'python',     label: 'Python', color: '#3572a5' },
  { id: 'java',       label: 'Java',   color: '#b07219' },
  { id: 'c',          label: 'C',      color: '#555555' },
];

// ─── Language-specific keyword sets ──────────────────────────────────────────
const KEYWORDS: Record<Language, RegExp> = {
  javascript: /\b(function|return|const|let|var|if|else|for|while|of|in|new|true|false|null|undefined|break|continue|class|this)\b/g,
  typescript: /\b(function|return|const|let|var|if|else|for|while|of|in|new|true|false|null|undefined|break|continue|class|this|type|interface|enum|readonly|as|extends|implements|void|number|string|boolean|never)\b/g,
  python:     /\b(def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|class|self|lambda|yield|with|as|pass|break|continue|range|len|append|pop|sorted|list|dict|set|print)\b/g,
  java:       /\b(public|private|protected|static|void|int|long|double|boolean|char|String|new|return|if|else|for|while|class|this|super|null|true|false|final|abstract|interface|extends|implements|import|package)\b/g,
  c:          /\b(int|void|char|float|double|long|short|unsigned|signed|struct|union|return|if|else|for|while|do|switch|case|break|continue|sizeof|static|const|NULL|malloc|free|calloc|printf|memset|strlen|strcpy|strcmp)\b/g,
};

const BUILTINS: Record<Language, RegExp | null> = {
  javascript: /\b(Math|Array|Map|Set|Object|JSON|console|push|pop|shift|unshift|length|has|get|set|fill|from|keys|values|entries|join|split|sort|map|filter|reduce|floor|ceil|abs|max|min|Infinity|slice|indexOf|includes|toString|parseInt|parseFloat)\b/g,
  typescript: /\b(Math|Array|Map|Set|Object|JSON|console|push|pop|shift|unshift|length|has|get|set|fill|from|keys|values|entries|join|split|sort|map|filter|reduce|floor|ceil|abs|max|min|Infinity|slice|indexOf|includes|toString|parseInt|parseFloat|Record|Partial|Required|Readonly|Pick|Omit)\b/g,
  python:     null,
  java:       /\b(Math|Arrays|ArrayList|LinkedList|HashMap|HashSet|Queue|Stack|Collections|System|Integer|String|List|Map|Set|PriorityQueue|Scanner|StringBuilder|Comparator|Optional|Stream)\b/g,
  c:          null,
};

function highlightLine(code: string, lang: Language, isActive: boolean): string {
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  if (lang === 'python') {
    html = html.replace(/(#.*$)/gm, '<span style="color:#6b7280">$1</span>');
  } else if (lang === 'c' || lang === 'java') {
    html = html.replace(/(\/\/.*$)/gm, '<span style="color:#6b7280">$1</span>');
  } else {
    html = html.replace(/(\/\/.*$)/gm, '<span style="color:#6b7280">$1</span>');
  }

  // Strings
  html = html.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span style="color:#86efac">$&</span>');

  // Builtins (before keywords to avoid double-wrapping)
  const builtinRe = BUILTINS[lang];
  if (builtinRe) {
    html = html.replace(new RegExp(builtinRe.source, 'g'), '<span style="color:#67e8f9">$&</span>');
  }

  // Keywords
  html = html.replace(new RegExp(KEYWORDS[lang].source, 'g'), '<span style="color:#c084fc">$1</span>');

  // Numbers
  html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#fb923c">$1</span>');

  return `<span style="color:${isActive ? '#e2e8f0' : '#94a3b8'}; white-space:pre">${html}</span>`;
}

// ─── Complexity badge colours ─────────────────────────────────────────────────
function complexityColor(notation: string): string {
  if (/O\(1\)|O\(log/.test(notation)) return '#22c55e';
  if (/O\(n\)|O\(k\)|O\(h\)/.test(notation)) return '#eab308';
  if (/O\(n.log|O\(n.k/.test(notation)) return '#f97316';
  return '#ef4444';
}

export default function CodePanel() {
  const { selectedAlgorithm, frames, currentFrameIndex, selectedLanguage, setLanguage } = useStore();
  const [complexityOpen, setComplexityOpen] = useState(false);
  const lineRef = useRef<HTMLDivElement | null>(null);

  const frame = frames[currentFrameIndex];
  const description = frame?.description ?? '';
  const variables = frame?.variables;
  const jsLine = frame?.line ?? -1;

  const lang = selectedLanguage;
  const algo = selectedAlgorithm;
  const code = algo?.codes[lang] ?? '';
  const lines = code.split('\n');

  // Resolve line number in the selected language
  const lineMap = algo?.lineMap?.[lang];
  const activeLine = lineMap ? (lineMap[jsLine] ?? -1) : jsLine;

  useEffect(() => {
    lineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeLine]);

  return (
    <div className="flex flex-col h-full bg-slate-950/80 border-l border-slate-800">

      {/* Language selector tabs */}
      <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-slate-800 bg-slate-900/50">
        {LANGUAGES.map(l => (
          <button
            key={l.id}
            onClick={() => setLanguage(l.id)}
            className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
              lang === l.id
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            style={lang === l.id ? { backgroundColor: l.color } : {}}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Description / step bar */}
      <div className="px-4 py-2 border-b border-slate-800 flex-shrink-0" style={{ minHeight: 52 }}>
        <motion.div
          key={description}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-slate-300 font-mono leading-relaxed"
        >
          <span className="text-blue-400 font-bold mr-2">▶</span>
          {description}
        </motion.div>
        {variables && Object.keys(variables).length > 0 && (
          <div className="mt-1 flex gap-3 flex-wrap">
            {Object.entries(variables).map(([k, v]) => (
              <span key={k} className="text-[10px] font-mono">
                <span className="text-slate-500">{k}=</span>
                <span className="text-yellow-400">{JSON.stringify(v)}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Code display */}
      <div className="flex-1 overflow-auto py-2 relative min-h-0">
        <div className="font-mono text-xs">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isActive = lineNum === activeLine;

            return (
              <div
                key={idx}
                ref={isActive ? (el => { lineRef.current = el; }) : undefined}
                className="relative flex items-stretch"
              >
                {isActive && (
                  <motion.div
                    layoutId={`code-highlight-${lang}`}
                    className="absolute inset-0 z-0"
                    initial={false}
                    style={{ background: 'rgba(59,130,246,0.12)', borderLeft: '3px solid #3b82f6' }}
                    transition={{ duration: 0.15 }}
                  />
                )}

                {/* Line number */}
                <span className={`relative z-10 select-none w-8 text-right pr-3 py-0.5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-400 font-bold' : 'text-slate-700'}`}>
                  {lineNum}
                </span>

                {/* Code */}
                <div className="relative z-10 flex-1 py-0.5 pr-4 leading-5">
                  <span
                    dangerouslySetInnerHTML={{ __html: highlightLine(line, lang, isActive) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complexity Analysis Panel */}
      {algo?.complexity && (
        <div className="flex-shrink-0 border-t border-slate-800">
          <button
            onClick={() => setComplexityOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/40 transition-colors"
          >
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <span className="text-slate-500">⏱</span> Complexity Analysis
            </span>
            {complexityOpen ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
          </button>

          <AnimatePresence>
            {complexityOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {/* Time / Space badges */}
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg p-2.5 bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={11} className="text-slate-500" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Time</span>
                      </div>
                      <span
                        className="font-mono font-bold text-sm"
                        style={{ color: complexityColor(algo.complexity.time) }}
                      >
                        {algo.complexity.time}
                      </span>
                    </div>

                    <div className="flex-1 rounded-lg p-2.5 bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Database size={11} className="text-slate-500" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Space</span>
                      </div>
                      <span
                        className="font-mono font-bold text-sm"
                        style={{ color: complexityColor(algo.complexity.space) }}
                      >
                        {algo.complexity.space}
                      </span>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="rounded-lg p-3 bg-slate-900/60 border border-slate-800">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {algo.complexity.reasoning}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
