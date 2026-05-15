import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';

export default function CodePanel() {
  const { selectedAlgorithm, frames, currentFrameIndex } = useStore();

  const currentLine = frames[currentFrameIndex]?.line ?? -1;
  const description = frames[currentFrameIndex]?.description ?? '';
  const variables = frames[currentFrameIndex]?.variables;

  const code = selectedAlgorithm?.code ?? '';
  const lines = code.split('\n');

  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    lineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentLine]);

  return (
    <div className="flex flex-col h-full bg-slate-950/80 border-l border-slate-800">
      {/* Description bar */}
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

        {/* Variables */}
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

      {/* Code */}
      <div className="flex-1 overflow-auto py-2 relative">
        <div className="font-mono text-xs">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isActive = lineNum === currentLine;

            return (
              <div
                key={idx}
                ref={isActive ? (el => { lineRef.current = el; }) : undefined}
                className="relative flex items-stretch group"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="code-highlight"
                    className="absolute inset-0 z-0"
                    initial={false}
                    animate={{ opacity: 1 }}
                    style={{ background: 'rgba(59,130,246,0.12)', borderLeft: '3px solid #3b82f6' }}
                    transition={{ duration: 0.15 }}
                  />
                )}

                {/* Line number */}
                <span
                  className={`relative z-10 select-none w-8 text-right pr-3 py-0.5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-blue-400 font-bold' : 'text-slate-700'
                  }`}
                >
                  {lineNum}
                </span>

                {/* Code content */}
                <div className="relative z-10 flex-1 py-0.5 pr-4 leading-5">
                  <SyntaxHighlight code={line} isActive={isActive} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simple syntax highlighter for JS
function SyntaxHighlight({ code, isActive }: { code: string; isActive: boolean }) {
  if (!code.trim()) return <span>&nbsp;</span>;

  const keywords = /\b(function|return|const|let|var|if|else|for|while|of|new|true|false|null|undefined|break|continue)\b/g;
  const numbers = /\b(\d+)\b/g;
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
  const comments = /(\/\/.*$)/gm;
  const builtins = /\b(Math|Array|Map|Set|console|push|pop|shift|unshift|length|has|get|set|fill|from|keys|values|entries|join|split|sort|map|filter|reduce|floor|ceil|abs|max|min|Infinity)\b/g;

  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Order matters: comments first, then strings, then keywords, then builtins
  html = html
    .replace(comments, '<span style="color:#6b7280">$1</span>')
    .replace(strings, '<span style="color:#86efac">$&</span>')
    .replace(keywords, '<span style="color:#c084fc">$1</span>')
    .replace(builtins, '<span style="color:#67e8f9">$&</span>')
    .replace(numbers, '<span style="color:#fb923c">$1</span>');

  return (
    <span
      style={{ color: isActive ? '#e2e8f0' : '#94a3b8', whiteSpace: 'pre' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
