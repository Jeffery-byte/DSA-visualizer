import { motion, AnimatePresence } from 'framer-motion';
import type { ArrayState } from '../../types';
import { getHighlightStyle } from './colors';

interface Props {
  arrays: ArrayState[];
}

export default function ArrayViz({ arrays }: Props) {
  return (
    <div className="flex flex-col gap-6 items-center justify-center h-full px-4">
      {arrays.map((arr) => (
        <div key={arr.id} className="w-full max-w-4xl">
          {arr.label && (
            <div className="text-xs font-mono text-slate-400 mb-2 px-1">{arr.label}</div>
          )}
          <div className="flex gap-1 flex-wrap justify-center">
            <AnimatePresence mode="popLayout">
              {arr.data.map((val, idx) => {
                const highlight = arr.highlights.find(h => h.index === idx);
                const pointer = arr.pointers?.find(p => p.index === idx);
                const style = highlight ? getHighlightStyle(highlight.color) : null;

                return (
                  <motion.div
                    key={`${arr.id}-${idx}`}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-1"
                  >
                    {/* Pointer label above */}
                    <div className="h-5 flex items-center justify-center">
                      {pointer && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-bold px-1 rounded"
                          style={{ color: pointer.color }}
                        >
                          {pointer.label}
                        </motion.span>
                      )}
                    </div>

                    {/* Cell */}
                    <motion.div
                      animate={highlight ? {
                        backgroundColor: style!.bg,
                        borderColor: style!.border,
                        boxShadow: style!.glow,
                        scale: highlight.color === 'swapping' || highlight.color === 'found' ? 1.1 : 1,
                      } : {
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        boxShadow: 'none',
                        scale: 1,
                      }}
                      transition={{ duration: 0.25 }}
                      className="w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm"
                      style={{
                        color: highlight ? style!.text : '#94a3b8',
                        minWidth: arr.data.length > 12 ? '2.2rem' : '3rem',
                        height: arr.data.length > 12 ? '2.2rem' : '3rem',
                      }}
                    >
                      {val === null ? '–' : String(val)}
                    </motion.div>

                    {/* Index label below */}
                    <div className="text-[10px] text-slate-500 font-mono">{idx}</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
