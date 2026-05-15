import { motion } from 'framer-motion';
import type { HeapState } from '../../types';
import { getHighlightStyle } from './colors';

interface Props {
  heap: HeapState;
}

const NODE_R = 24;
const H_GAP = 20;
const V_GAP = 60;

function getHeapNodePosition(i: number, n: number): { x: number; y: number } {
  const depth = Math.floor(Math.log2(i + 1));
  const posInLevel = i - (Math.pow(2, depth) - 1);
  const levelCount = Math.pow(2, depth);
  const maxDepth = Math.floor(Math.log2(n));
  const maxNodes = Math.pow(2, maxDepth);
  const totalWidth = maxNodes * (NODE_R * 2 + H_GAP);
  const spacing = totalWidth / levelCount;
  const x = spacing * posInLevel + spacing / 2;
  const y = depth * V_GAP + NODE_R + 10;
  return { x, y };
}

export default function HeapViz({ heap }: Props) {
  const { data, highlights, sortedFrom } = heap;
  const n = sortedFrom ?? data.length;

  // Compute SVG dimensions
  const maxDepth = n > 0 ? Math.floor(Math.log2(n)) : 0;
  const maxNodes = Math.pow(2, maxDepth);
  const svgWidth = Math.max(300, maxNodes * (NODE_R * 2 + H_GAP));
  const svgHeight = (maxDepth + 1) * V_GAP + NODE_R + 30;

  const positions = data.map((_, i) => getHeapNodePosition(i, n));

  return (
    <div className="flex flex-col items-center justify-start h-full gap-4 py-4 overflow-auto">
      {/* Tree visualization */}
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Edges */}
        {data.map((_, i) => {
          if (i === 0 || i >= n) return null;
          const parent = Math.floor((i - 1) / 2);
          const { x, y } = positions[i];
          const { x: px, y: py } = positions[parent];
          return (
            <line key={`edge-${i}`} x1={px} y1={py} x2={x} y2={y} stroke="#334155" strokeWidth={2} />
          );
        })}

        {/* Nodes */}
        {data.map((val, i) => {
          const { x, y } = positions[i];
          const hl = highlights.find(h => h.index === i);
          const style = hl ? getHighlightStyle(hl.color) : null;
          const isSorted = sortedFrom != null && i >= sortedFrom;

          let fill = '#1e293b';
          let stroke = '#475569';
          let textColor = '#94a3b8';
          let shadow = 'none';

          if (isSorted) {
            fill = '#14532d'; stroke = '#22c55e'; textColor = '#4ade80';
          } else if (style) {
            fill = style.bg; stroke = style.border; textColor = style.text; shadow = style.glow;
          }

          if (i >= n) {
            fill = '#111827'; stroke = '#1f2937'; textColor = '#374151';
          }

          return (
            <g key={`node-${i}`}>
              {hl && style && shadow !== 'none' && (
                <motion.circle
                  cx={x} cy={y} r={NODE_R + 5}
                  fill="none"
                  stroke={style.border}
                  strokeWidth={1.5}
                  opacity={0.4}
                  animate={{ r: [NODE_R + 4, NODE_R + 8, NODE_R + 4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              <motion.circle
                cx={x} cy={y} r={NODE_R}
                animate={{ fill, stroke, filter: shadow !== 'none' ? `drop-shadow(0 0 6px ${stroke})` : 'none' }}
                strokeWidth={2}
                transition={{ duration: 0.25 }}
              />
              <text
                x={x} y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 12, fill: textColor, fontFamily: 'monospace', fontWeight: 'bold', pointerEvents: 'none' }}
              >
                {i < n ? String(val) : ''}
              </text>
              {/* Index label */}
              <text
                x={x} y={y + NODE_R + 12}
                textAnchor="middle"
                style={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }}
              >
                [{i}]
              </text>
            </g>
          );
        })}
      </svg>

      {/* Array representation */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs text-slate-500 font-mono">Array Representation</div>
        <div className="flex gap-1 flex-wrap justify-center">
          {data.map((val, i) => {
            const hl = highlights.find(h => h.index === i);
            const style = hl ? getHighlightStyle(hl.color) : null;
            const isSorted = sortedFrom != null && i >= sortedFrom;

            return (
              <div key={i} className="flex flex-col items-center">
                <motion.div
                  animate={isSorted ? { backgroundColor: '#14532d', borderColor: '#22c55e', boxShadow: 'none' } :
                    style ? { backgroundColor: style.bg, borderColor: style.border, boxShadow: style.glow } :
                    { backgroundColor: '#1e293b', borderColor: '#334155', boxShadow: 'none' }}
                  transition={{ duration: 0.2 }}
                  className="w-9 h-9 flex items-center justify-center rounded border-2 font-mono font-bold text-xs"
                  style={{ color: isSorted ? '#4ade80' : style ? style.text : '#6b7280' }}
                >
                  {val}
                </motion.div>
                <span className="text-[9px] text-slate-600 font-mono">{i}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
