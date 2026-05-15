import { motion, AnimatePresence } from 'framer-motion';
import type { HashMapState } from '../../types';
import { getHighlightStyle } from './colors';

interface Props {
  hashmap: HashMapState;
}

export default function HashMapViz({ hashmap }: Props) {
  const { entries } = hashmap;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-3">
      <div className="text-xs font-mono text-slate-400 self-start ml-2">HashMap</div>
      <div
        className="w-full max-w-md rounded-xl border border-slate-700 overflow-hidden bg-slate-900/70"
        style={{ minHeight: 120 }}
      >
        {/* Header */}
        <div className="grid grid-cols-2 bg-slate-800 px-4 py-2 border-b border-slate-700">
          <span className="text-xs font-mono font-bold text-slate-300">key</span>
          <span className="text-xs font-mono font-bold text-slate-300">value</span>
        </div>

        {/* Entries */}
        <div className="divide-y divide-slate-800">
          <AnimatePresence>
            {entries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-6 text-center text-xs text-slate-600 font-mono"
              >
                empty
              </motion.div>
            ) : (
              entries.map((entry, i) => {
                const hl = entry.highlight;
                const style = hl ? getHighlightStyle(hl) : null;

                return (
                  <motion.div
                    key={`${entry.key}-${i}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      backgroundColor: style ? style.bg : 'transparent',
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-2 px-4 py-2"
                    style={style ? { boxShadow: `inset 3px 0 0 ${style.border}` } : {}}
                  >
                    <span
                      className="font-mono font-bold text-sm"
                      style={{ color: style ? style.border : '#f59e0b' }}
                    >
                      {String(entry.key)}
                    </span>
                    <span
                      className="font-mono text-sm"
                      style={{ color: style ? style.text : '#94a3b8' }}
                    >
                      {String(entry.value)}
                    </span>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
