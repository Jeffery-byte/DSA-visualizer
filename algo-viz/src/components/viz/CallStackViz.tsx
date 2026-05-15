import { motion, AnimatePresence } from 'framer-motion';
import type { CallStackFrame } from '../../types';
import { getHighlightStyle } from './colors';

interface Props {
  callStack: CallStackFrame[];
}

const DEPTH_COLORS = [
  { bg: '#1e3a5f', border: '#3b82f6' },
  { bg: '#3b0764', border: '#a855f7' },
  { bg: '#065f46', border: '#10b981' },
  { bg: '#7c2d12', border: '#f97316' },
  { bg: '#4a1d96', border: '#8b5cf6' },
  { bg: '#134e4a', border: '#14b8a6' },
];

export default function CallStackViz({ callStack }: Props) {
  const maxDepth = callStack.reduce((acc, f) => Math.max(acc, f.depth), 0);

  return (
    <div className="flex flex-col items-center h-full px-5 gap-3 overflow-auto py-5">
      <div className="text-sm font-semibold text-slate-400 self-start">Call Stack</div>

      {callStack.length === 0 ? (
        <div className="text-sm text-slate-600 font-mono mt-4">Stack is empty</div>
      ) : (
        <div className="flex flex-col gap-2.5 w-full">
          <AnimatePresence>
            {callStack.map((frame) => {
              const depthColor = DEPTH_COLORS[frame.depth % DEPTH_COLORS.length];
              const hl         = frame.highlight;
              const hlStyle    = hl ? getHighlightStyle(hl) : null;
              const isActive   = frame.isActive;
              const indent     = frame.depth * 24;

              return (
                <motion.div
                  key={frame.id}
                  layout
                  initial={{ opacity: 0, x: -30, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 30, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                  style={{ paddingLeft: indent }}
                >
                  {frame.depth > 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 opacity-25"
                      style={{ left: indent - 12, backgroundColor: depthColor.border }}
                    />
                  )}

                  <motion.div
                    animate={hlStyle ? {
                      backgroundColor: hlStyle.bg,
                      borderColor:     hlStyle.border,
                      boxShadow:       hlStyle.glow,
                    } : isActive ? {
                      backgroundColor: depthColor.bg,
                      borderColor:     depthColor.border,
                      boxShadow:       `0 0 10px ${depthColor.border}40`,
                    } : {
                      backgroundColor: '#1e293b',
                      borderColor:     '#334155',
                      boxShadow:       'none',
                    }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl border px-4 py-3 font-mono"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="font-bold text-base"
                        style={{ color: hlStyle ? hlStyle.text : isActive ? depthColor.border : '#64748b' }}
                      >
                        {frame.funcName}
                      </span>
                      {isActive && (
                        <motion.span
                          animate={{ opacity: [1, 0.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: depthColor.border }}
                        />
                      )}
                    </div>

                    {/* Args */}
                    <div className="text-sm mt-1.5 flex gap-3 flex-wrap">
                      {Object.entries(frame.args).map(([k, v]) => (
                        <span key={k} className="text-slate-400">
                          <span className="text-slate-500">{k}=</span>
                          <span style={{ color: depthColor.border }}>{JSON.stringify(v)}</span>
                        </span>
                      ))}
                    </div>

                    {/* Return value */}
                    {frame.returnValue !== undefined && (
                      <div className="text-sm mt-1.5">
                        <span className="text-slate-500">returns </span>
                        <span className="text-emerald-400 font-bold">{String(frame.returnValue)}</span>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {callStack.length > 0 && (
        <div className="text-xs text-slate-500 font-mono mt-1 self-start">
          Depth: {maxDepth + 1} · Frames: {callStack.length}
        </div>
      )}
    </div>
  );
}
