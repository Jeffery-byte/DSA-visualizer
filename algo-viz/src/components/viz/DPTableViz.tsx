import { motion } from 'framer-motion';
import type { DPTableState } from '../../types';
import { getHighlightStyle } from './colors';

interface Props {
  dpTable: DPTableState;
}

export default function DPTableViz({ dpTable }: Props) {
  const { data, highlights, rowLabels, colLabels, is1D, dpArray } = dpTable;
  if (is1D && dpArray) return <DPArray array={dpArray} highlights={highlights} colLabels={colLabels} />;
  return <DPGrid data={data} highlights={highlights} rowLabels={rowLabels} colLabels={colLabels} />;
}

// ─── 1-D array ────────────────────────────────────────────────────────────────
function DPArray({
  array, highlights, colLabels,
}: {
  array: DPTableState['dpArray'];
  highlights: DPTableState['highlights'];
  colLabels?: string[];
}) {
  if (!array) return null;
  const cellSize = Math.max(48, Math.min(64, Math.floor(520 / array.length)));
  const fontSize = cellSize < 52 ? 13 : 16;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-5">
      <div className="text-sm font-mono font-semibold text-slate-400">dp[ ]</div>
      <div className="flex gap-2 flex-wrap justify-center max-w-4xl">
        {array.map((val, idx) => {
          const hl    = highlights.find(h => h.col === idx);
          const style = hl ? getHighlightStyle(hl.color) : null;

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              {colLabels && (
                <div className="text-xs font-mono text-slate-500 text-center">{colLabels[idx]}</div>
              )}
              <motion.div
                animate={hl ? {
                  backgroundColor: style!.bg,
                  borderColor:     style!.border,
                  boxShadow:       style!.glow,
                  scale: ['found','result'].includes(hl.color) ? 1.12 : 1.05,
                } : {
                  backgroundColor: '#1e293b',
                  borderColor:     '#334155',
                  boxShadow:       'none',
                  scale: 1,
                }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-center rounded-xl border-2 font-mono font-bold"
                style={{
                  width:    cellSize,
                  height:   cellSize,
                  fontSize,
                  color: hl ? style!.text : '#6b7280',
                }}
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

// ─── 2-D table ────────────────────────────────────────────────────────────────
function DPGrid({
  data, highlights, rowLabels, colLabels,
}: {
  data:        DPTableState['data'];
  highlights:  DPTableState['highlights'];
  rowLabels?:  string[];
  colLabels?:  string[];
}) {
  const rows     = data.length;
  const cols     = data[0]?.length ?? 0;
  const cellSize = Math.max(36, Math.min(56, Math.floor(420 / Math.max(rows, cols))));
  const fontSize = cellSize < 42 ? 12 : 15;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 overflow-auto py-5 px-5">
      <div className="overflow-auto rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
        <table className="border-collapse" style={{ borderSpacing: 3 }}>
          {colLabels && (
            <thead>
              <tr>
                {rowLabels && <td style={{ minWidth: 32 }} />}
                {colLabels.map((label, j) => (
                  <td key={j} className="text-center font-mono text-sm text-slate-400 pb-2 px-1" style={{ width: cellSize }}>
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
                  <td className="text-center font-mono text-sm text-slate-400 pr-2" style={{ minWidth: 32 }}>
                    {rowLabels[i]}
                  </td>
                )}
                {row.map((val, j) => {
                  const hl    = highlights.find(h => h.row === i && h.col === j);
                  const style = hl ? getHighlightStyle(hl.color) : null;

                  return (
                    <td key={j} className="p-0.5">
                      <motion.div
                        animate={hl ? {
                          backgroundColor: style!.bg,
                          borderColor:     style!.border,
                          boxShadow:       style!.glow,
                          scale: ['found','result'].includes(hl.color) ? 1.08 : 1,
                        } : {
                          backgroundColor: '#1e293b',
                          borderColor:     '#334155',
                          boxShadow:       'none',
                          scale: 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center rounded-lg border-2 font-mono font-bold"
                        style={{
                          width:    cellSize,
                          height:   cellSize,
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
