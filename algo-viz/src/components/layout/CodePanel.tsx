import { useEffect, useRef, useState, useCallback } from 'react';
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

const RX_COMMENT: Record<Language, RegExp> = {
  javascript: /\/\/.*$/gm,
  typescript: /\/\/.*$/gm,
  python:     /#.*$/gm,
  java:       /\/\/.*$/gm,
  c:          /\/\/.*$|\/\*[\s\S]*?\*\//gm,
};

const RX_STRING = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;

const RX_KEYWORDS: Record<Language, RegExp> = {
  javascript: /\b(function|return|const|let|var|if|else|for|while|of|in|new|true|false|null|undefined|break|continue|class|this)\b/g,
  typescript: /\b(function|return|const|let|var|if|else|for|while|of|in|new|true|false|null|undefined|break|continue|class|this|type|interface|enum|readonly|as|extends|implements|void|number|string|boolean|never)\b/g,
  python:     /\b(def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|class|self|lambda|yield|with|as|pass|break|continue|range|len|append|pop|sorted|list|dict|set|print)\b/g,
  java:       /\b(public|private|protected|static|void|int|long|double|boolean|char|String|new|return|if|else|for|while|class|this|super|null|true|false|final|abstract|interface|extends|implements|import|package)\b/g,
  c:          /\b(int|void|char|float|double|long|short|unsigned|signed|struct|union|return|if|else|for|while|do|switch|case|break|continue|sizeof|static|const|NULL|malloc|free|calloc|printf|memset|strlen|strcpy|strcmp)\b/g,
};

const RX_BUILTINS: Record<Language, RegExp | null> = {
  javascript: /\b(Math|Array|Map|Set|Object|JSON|console|push|pop|shift|unshift|length|has|get|set|fill|from|keys|values|entries|join|split|sort|map|filter|reduce|floor|ceil|abs|max|min|Infinity|slice|indexOf|includes|parseInt|parseFloat)\b/g,
  typescript: /\b(Math|Array|Map|Set|Object|JSON|console|push|pop|shift|unshift|length|has|get|set|fill|from|keys|values|entries|join|split|sort|map|filter|reduce|floor|ceil|abs|max|min|Infinity|slice|indexOf|includes|parseInt|parseFloat|Record|Partial|Required|Readonly|Pick|Omit)\b/g,
  python:     null,
  java:       /\b(Math|Arrays|ArrayList|LinkedList|HashMap|HashSet|Queue|Stack|Collections|System|Integer|List|Map|Set|PriorityQueue|StringBuilder|Optional|Stream)\b/g,
  c:          null,
};

const RX_NUMBER = /\b(\d+(?:\.\d+)?)\b/g;

function highlightLine(code: string, lang: Language, isActive: boolean): string {
  let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(RX_COMMENT[lang],  m => `<span style="color:#6b7280">${m}</span>`);
  html = html.replace(RX_STRING,          m => `<span style="color:#86efac">${m}</span>`);
  const builtinRx = RX_BUILTINS[lang];
  if (builtinRx) html = html.replace(builtinRx, m => `<span style="color:#67e8f9">${m}</span>`);
  html = html.replace(RX_KEYWORDS[lang],  m => `<span style="color:#c084fc">${m}</span>`);
  html = html.replace(RX_NUMBER,          m => `<span style="color:#fb923c">${m}</span>`);
  return `<span style="color:${isActive ? '#f1f5f9' : '#94a3b8'};white-space:pre">${html}</span>`;
}

function complexityColor(n: string): string {
  if (/O\(1\)|O\(log/.test(n))        return '#22c55e';
  if (/O\(n\)|O\(k\)|O\(h\)/.test(n)) return '#eab308';
  if (/O\(n.log|O\(n.k/.test(n))      return '#f97316';
  return '#ef4444';
}

export default function CodePanel() {
  const { selectedAlgorithm, frames, currentFrameIndex, selectedLanguage, setLanguage } = useStore();
  const [complexityOpen, setComplexityOpen] = useState(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const frame      = frames[currentFrameIndex];
  const jsLine     = frame?.line ?? -1;
  const lang       = selectedLanguage;
  const algo       = selectedAlgorithm;
  const code       = algo?.codes[lang] ?? '';
  const lines      = code.split('\n');
  const lineMap    = algo?.lineMap?.[lang];
  const activeLine = lineMap ? (lineMap[jsLine] ?? -1) : jsLine;

  const setActiveLineRef = useCallback((el: HTMLDivElement | null) => {
    activeLineRef.current = el;
  }, []);

  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeLine]);

  const toggleComplexity = useCallback(() => setComplexityOpen(o => !o), []);

  return (
    <div className="flex flex-col h-full bg-slate-950 border-l border-slate-800">

      {/* Language tabs */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 border-b border-slate-800 bg-slate-900/60"
        role="tablist" aria-label="Programming language">
        {LANGUAGES.map(l => (
          <button
            key={l.id}
            role="tab"
            aria-selected={lang === l.id}
            onClick={() => setLanguage(l.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold transition-all ${
              lang === l.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700/60'
            }`}
            style={lang === l.id ? { backgroundColor: l.color } : {}}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Step description */}
      <div className="px-4 py-3 border-b border-slate-800 flex-shrink-0 min-h-[64px]">
        <motion.div
          key={frame?.description}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-slate-200 font-mono leading-relaxed"
        >
          <span className="text-blue-400 font-bold mr-2">▶</span>
          {frame?.description ?? ''}
        </motion.div>
        {frame?.variables && Object.keys(frame.variables).length > 0 && (
          <div className="mt-2 flex gap-4 flex-wrap">
            {Object.entries(frame.variables).map(([k, v]) => (
              <span key={k} className="text-xs font-mono">
                <span className="text-slate-500">{k}=</span>
                <span className="text-yellow-400 font-semibold">{JSON.stringify(v)}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Code listing */}
      <div className="flex-1 overflow-auto py-3 min-h-0" role="tabpanel" aria-label={`${lang} code`}>
        <div className="font-mono" style={{ fontSize: 13 }}>
          {lines.map((line, idx) => {
            const lineNum  = idx + 1;
            const isActive = lineNum === activeLine;

            return (
              <div
                key={idx}
                ref={isActive ? setActiveLineRef : undefined}
                className="relative flex items-stretch"
              >
                {isActive && (
                  <motion.div
                    layoutId="code-active-line"
                    className="absolute inset-0 z-0"
                    initial={false}
                    style={{ background: 'rgba(59,130,246,0.15)', borderLeft: '3px solid #3b82f6' }}
                    transition={{ duration: 0.15 }}
                  />
                )}
                <span className={`relative z-10 select-none text-right pr-4 py-0.5 flex-shrink-0 ${
                  isActive ? 'text-blue-400 font-bold' : 'text-slate-700'
                }`} style={{ width: 40 }}>
                  {lineNum}
                </span>
                <div
                  className="relative z-10 flex-1 py-0.5 pr-5"
                  style={{ lineHeight: '1.7' }}
                  dangerouslySetInnerHTML={{ __html: highlightLine(line, lang, isActive) }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Complexity Analysis */}
      {algo?.complexity && (
        <div key={algo.id} className="flex-shrink-0 border-t border-slate-800">
          <button
            onClick={toggleComplexity}
            aria-expanded={complexityOpen}
            aria-controls="complexity-panel"
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <span className="text-slate-500" aria-hidden="true">⏱</span>
              Complexity Analysis
            </span>
            {complexityOpen
              ? <ChevronUp   size={15} className="text-slate-500" />
              : <ChevronDown size={15} className="text-slate-500" />}
          </button>

          <AnimatePresence>
            {complexityOpen && (
              <motion.div
                id="complexity-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-xl p-3 bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock size={12} className="text-slate-500" aria-hidden="true" />
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Time</span>
                      </div>
                      <span className="font-mono font-bold text-base" style={{ color: complexityColor(algo.complexity.time) }}>
                        {algo.complexity.time}
                      </span>
                    </div>
                    <div className="flex-1 rounded-xl p-3 bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Database size={12} className="text-slate-500" aria-hidden="true" />
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Space</span>
                      </div>
                      <span className="font-mono font-bold text-base" style={{ color: complexityColor(algo.complexity.space) }}>
                        {algo.complexity.space}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 bg-slate-900/60 border border-slate-800">
                    <p className="text-xs text-slate-400 leading-relaxed">
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
