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

  // Fit cell size to screen — generous minimum of 36px
  const cellSize = Math.max(36, Math.min(60, Math.floor(460 / Math.max(rows, cols))));
  const fontSize = cellSize < 42 ? 12 : 15;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 py-4 px-4">
      <div
        className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: 3,
          padding: 10,
          background: '#0f172a',
        }}
      >
        {data.map((row, r) =>
          row.map((val, c) => {
            const highlight = highlights.find(h => h.row === r && h.col === c);
            const isVisited = visitedCells?.[r]?.[c];
            const isOnPath  = pathCells?.some(([pr, pc]) => pr === r && pc === c);
            const isWall    = val === 1 || val === true;

            let bg         = '#1e293b';
            let border     = '#334155';
            let textColor  = '#64748b';
            let boxShadow  = 'none';
            let display: string = String(val === 0 ? '' : val === 1 ? '' : val);

            if (isWall) {
              bg = '#0f172a'; border = '#1e293b'; textColor = '#374151';
            } else if (highlight) {
              const s = getHighlightStyle(highlight.color);
              bg = s.bg; border = s.border; textColor = s.text; boxShadow = s.glow;
              display = highlight.label ?? (val === 0 ? '' : String(val));
            } else if (isOnPath) {
              bg = '#0e4a6e'; border = '#06b6d4'; textColor = '#fff';
            } else if (isVisited) {
              bg = '#14532d'; border = '#166534'; textColor = '#4ade80';
            }

            return (
              <motion.div
                key={`${r}-${c}`}
                animate={{ backgroundColor: bg, borderColor: border, boxShadow, scale: highlight ? 1.04 : 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center rounded-lg border font-mono font-bold cursor-default select-none"
                style={{ width: cellSize, height: cellSize, fontSize, color: textColor, borderWidth: 1.5 }}
              >
                {!isWall && display ? <span className="text-center leading-none">{display}</span> : null}
                {isWall && (
                  <div className="w-full h-full rounded-md" style={{ backgroundColor: '#1e293b' }} />
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap justify-center">
        {[
          { color: '#38bdf8', label: 'Start'   },
          { color: '#f87171', label: 'End'     },
          { color: '#f59e0b', label: 'Visiting'},
          { color: '#4ade80', label: 'Visited' },
          { color: '#06b6d4', label: 'Path'    },
          { color: '#374151', label: 'Wall'    },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: color }} />
            <span className="text-sm text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
