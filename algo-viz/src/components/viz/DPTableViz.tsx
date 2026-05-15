import { motion } from 'framer-motion';
import type { DPTableState } from '../../types';
import { getHighlightStyle } from './colors';

interface Props {
  dpTable: DPTableState;
}

export default function DPTableViz({ dpTable }: Props) {
  const { data, highlights, rowLabels, colLabels, is1D, dpArray } = dpTable;

  if (is1D && dpArray) {
    return <DPArray array={dpArray} highlights={highlights} colLabels={colLabels} />;
  }

  return <DPGrid data={data} highlights={highlights} rowLabels={rowLabels} colLabels={colLabels} />;
}

function DPArray({ array, highlights, colLabels }: { array: DPTableState['dpArray']; highlights: DPTableState['highlights']; colLabels?: string[] }) {
  if (!array) return null;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div className="text-xs text-slate-400 font-mono mb-1">dp[ ]</div>
      <div className="flex gap-1 flex-wrap justify-center max-w-3xl">
        {array.map((val, idx) => {
          const hl = highlights.find(h => h.col === idx);
          const style = hl ? getHighlightStyle(hl.color) : null;

          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              {colLabels && (
                <div className="text-[10px] font-mono text-slate-500 text-center">{colLabels[idx]}</div>
              )}
              <motion.div
                animate={hl ? {
                  backgroundColor: style!.bg,
                  borderColor: style!.border,
                  boxShadow: style!.glow,
                  scale: hl.color === 'found' || hl.color === 'result' ? 1.15 : 1.05,
                } : {
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  boxShadow: 'none',
                  scale: 1,
                }}
                transition={{ duration: 0.25 }}
                className="w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm"
                style={{ color: hl ? style!.text : '#6b7280', minWidth: '2.8rem' }}
              >
                {String(val)}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DPGrid({ data, highlights, rowLabels, colLabels }: { data: DPTableState['data']; highlights: DPTableState['highlights']; rowLabels?: string[]; colLabels?: string[] }) {
  const cellSize = Math.max(32, Math.min(52, Math.floor(380 / Math.max(data.length, data[0]?.length ?? 1))));
  const fontSize = cellSize < 38 ? 11 : 13;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 overflow-auto py-4 px-4">
      <div className="overflow-auto rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <table className="border-collapse" style={{ borderSpacing: 2 }}>
          {colLabels && (
            <thead>
              <tr>
                {rowLabels && <td className="w-8" />}
                {colLabels.map((label, j) => (
                  <td
                    key={j}
                    className="text-center font-mono text-xs text-slate-400 pb-1 px-0.5"
                    style={{ width: cellSize }}
                  >
                    {label}
                  </td>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {rowLabels && (
                  <td className="text-center font-mono text-xs text-slate-400 pr-1" style={{ minWidth: 24 }}>
                    {rowLabels[i]}
                  </td>
                )}
                {row.map((val, j) => {
                  const hl = highlights.find(h => h.row === i && h.col === j);
                  const style = hl ? getHighlightStyle(hl.color) : null;

                  return (
                    <td key={j} className="p-0.5">
                      <motion.div
                        animate={hl ? {
                          backgroundColor: style!.bg,
                          borderColor: style!.border,
                          boxShadow: style!.glow,
                          scale: hl.color === 'found' || hl.color === 'result' ? 1.1 : 1,
                        } : {
                          backgroundColor: '#1e293b',
                          borderColor: '#334155',
                          boxShadow: 'none',
                          scale: 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center rounded border-2 font-mono font-bold"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          fontSize,
                          color: hl ? style!.text : '#64748b',
                        }}
                      >
                        {String(val)}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
