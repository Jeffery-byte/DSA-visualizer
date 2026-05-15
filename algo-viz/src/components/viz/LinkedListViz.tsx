import { motion, AnimatePresence } from 'framer-motion';
import type { LinkedListState } from '../../types';


interface Props {
  list: LinkedListState;
}

export default function LinkedListViz({ list }: Props) {
  const { nodes, activeIndex, pointers } = list;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 py-4">
      <div className="text-xs font-mono text-slate-400 self-start">Linked List</div>

      {nodes.length === 0 ? (
        <div className="text-slate-600 font-mono text-sm">empty list</div>
      ) : (
        <div className="flex items-center gap-0 flex-wrap justify-center">
          <AnimatePresence>
            {nodes.map((val, idx) => {
              const isActive  = idx === activeIndex;
              const ptr       = pointers?.find(p => p.index === idx);
              const isLast    = idx === nodes.length - 1;

              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center"
                >
                  {/* Node */}
                  <div className="flex flex-col items-center gap-1">
                    {/* Pointer label above */}
                    <div className="h-5 flex items-center">
                      {ptr && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-bold font-mono"
                          style={{ color: ptr.color }}
                        >
                          {ptr.label}
                        </motion.span>
                      )}
                    </div>

                    {/* Node box (split: val | next) */}
                    <motion.div
                      animate={isActive ? {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 12px #3b82f6',
                      } : {
                        borderColor: '#334155',
                        boxShadow: 'none',
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex rounded-lg border-2 overflow-hidden"
                    >
                      {/* Value field */}
                      <motion.div
                        animate={isActive ? {
                          backgroundColor: '#1d4ed8',
                        } : {
                          backgroundColor: '#1e293b',
                        }}
                        transition={{ duration: 0.2 }}
                        className="w-12 h-12 flex items-center justify-center font-mono font-bold text-sm border-r border-slate-700"
                        style={{ color: isActive ? '#fff' : '#94a3b8' }}
                      >
                        {val === null ? 'null' : String(val)}
                      </motion.div>

                      {/* Next pointer field */}
                      <div
                        className="w-8 h-12 flex items-center justify-center"
                        style={{ backgroundColor: '#141e2e' }}
                      >
                        {isLast ? (
                          <span className="text-[9px] font-mono text-slate-600">∅</span>
                        ) : (
                          <span className="text-slate-500 text-xs">→</span>
                        )}
                      </div>
                    </motion.div>

                    {/* Index label */}
                    <div className="text-[10px] text-slate-600 font-mono">[{idx}]</div>
                  </div>

                  {/* Arrow connector between nodes */}
                  {!isLast && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center pb-5"
                    >
                      <svg width="28" height="16" viewBox="0 0 28 16" className="-mx-1">
                        <line x1="0" y1="8" x2="20" y2="8" stroke="#475569" strokeWidth="1.5" />
                        <polygon points="20,4 28,8 20,12" fill="#475569" />
                      </svg>
                    </motion.div>
                  )}

                  {/* NULL terminator after last node */}
                  {isLast && (
                    <div className="flex items-center pb-5 ml-1">
                      <svg width="28" height="16" viewBox="0 0 28 16">
                        <line x1="0" y1="8" x2="20" y2="8" stroke="#374151" strokeWidth="1.5" strokeDasharray="3,2" />
                        <polygon points="20,4 28,8 20,12" fill="#374151" />
                      </svg>
                      <span className="text-[10px] font-mono text-slate-600 ml-1">NULL</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
