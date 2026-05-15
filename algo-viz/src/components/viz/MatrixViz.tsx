import { motion } from 'framer-motion';
import type { MatrixState } from '../../types';
import { getHighlightStyle } from './colors';

interface Props {
  matrix: MatrixState;
}

export default function MatrixViz({ matrix }: Props) {
  const { data, highlights, visitedCells, pathCells } = matrix;
  const rows = data.length;
  const cols = data[0]?.length ?? 0;

  // Compute cell size based on grid dimensions
  const cellSize = Math.max(28, Math.min(52, Math.floor(420 / Math.max(rows, cols))));
  const fontSize = cellSize < 36 ? 11 : 13;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div
        className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 2, padding: 8, background: '#0f172a' }}
      >
        {data.map((row, r) =>
          row.map((val, c) => {
            const highlight = highlights.find(h => h.row === r && h.col === c);
            const isVisited = visitedCells?.[r]?.[c];
            const isOnPath = pathCells?.some(([pr, pc]) => pr === r && pc === c);
            const isWall = val === 1 || val === true;

            let bgColor = '#1e293b';
            let borderColor = '#334155';
            let textColor = '#64748b';
            let boxShadow = 'none';
            let displayChar: string = String(val === 0 ? '' : val === 1 ? '█' : val);

            if (isWall) {
              bgColor = '#0f172a';
              borderColor = '#1e293b';
              textColor = '#374151';
              displayChar = '█';
            } else if (highlight) {
              const s = getHighlightStyle(highlight.color);
              bgColor = s.bg;
              borderColor = s.border;
              textColor = s.text;
              boxShadow = s.glow;
              displayChar = highlight.label ?? (val === 0 ? '' : String(val));
            } else if (isOnPath) {
              bgColor = '#0e4a6e';
              borderColor = '#06b6d4';
              textColor = '#fff';
            } else if (isVisited) {
              bgColor = '#14532d';
              borderColor = '#166534';
              textColor = '#4ade80';
            }

            return (
              <motion.div
                key={`${r}-${c}`}
                animate={{ backgroundColor: bgColor, borderColor, boxShadow, scale: highlight ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center rounded border font-mono font-bold cursor-default select-none"
                style={{ width: cellSize, height: cellSize, fontSize, color: textColor, borderWidth: 1 }}
              >
                {isWall ? null : (
                  <span className="text-center leading-none">{displayChar}</span>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap justify-center">
        {[
          { color: '#38bdf8', label: 'Start' },
          { color: '#f87171', label: 'End' },
          { color: '#f59e0b', label: 'Visiting' },
          { color: '#4ade80', label: 'Visited' },
          { color: '#06b6d4', label: 'Path' },
          { color: '#374151', label: 'Wall' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
