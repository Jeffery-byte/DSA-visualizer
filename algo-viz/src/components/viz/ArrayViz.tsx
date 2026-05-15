import { motion, AnimatePresence } from 'framer-motion';
import type { ArrayState } from '../../types';
import { getHighlightStyle } from './colors';

interface Props {
  arrays: ArrayState[];
}

export default function ArrayViz({ arrays }: Props) {
  return (
    <div className="flex flex-col gap-8 items-center justify-center h-full px-6 py-4">
      {arrays.map((arr) => {
        // Scale cell size based on array length
        const isLong   = arr.data.length > 12;
        const cellSize = isLong ? 44 : 56;
        const fontSize = isLong ? 13 : 16;

        return (
          <div key={arr.id} className="w-full max-w-5xl">
            {arr.label && (
              <div className="text-sm font-mono text-slate-400 mb-3 px-1 font-medium">{arr.label}</div>
            )}
            <div className="flex gap-2 flex-wrap justify-center">
              <AnimatePresence mode="popLayout">
                {arr.data.map((val, idx) => {
                  const highlight = arr.highlights.find(h => h.index === idx);
                  const pointer   = arr.pointers?.find(p => p.index === idx);
                  const style     = highlight ? getHighlightStyle(highlight.color) : null;

                  return (
                    <motion.div
                      key={`${arr.id}-${idx}`}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      {/* Pointer label */}
                      <div style={{ height: 22 }} className="flex items-center justify-center">
                        {pointer && (
                          <motion.span
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-bold font-mono px-1 rounded"
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
                          borderColor:     style!.border,
                          boxShadow:       style!.glow,
                          scale: ['swapping','found'].includes(highlight.color) ? 1.12 : 1,
                        } : {
                          backgroundColor: '#1e293b',
                          borderColor:     '#334155',
                          boxShadow:       'none',
                          scale: 1,
                        }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center justify-center rounded-xl border-2 font-mono font-bold"
                        style={{
                          width:  cellSize,
                          height: cellSize,
                          fontSize,
                          color: highlight ? style!.text : '#94a3b8',
                        }}
                      >
                        {val === null ? '–' : String(val)}
                      </motion.div>

                      {/* Index label */}
                      <div className="text-xs text-slate-600 font-mono">{idx}</div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
