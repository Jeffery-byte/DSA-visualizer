import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { GraphVizState } from '../../types';
import { getHighlightStyle } from './colors';

interface Props {
  graph: GraphVizState;
}

const NODE_R = 22;

/** Lay nodes out on a circle, with large graphs using multiple rings. */
function computeLayout(nodes: string[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const n = nodes.length;

  if (n === 0) return positions;

  if (n <= 12) {
    // Single circle
    const r = Math.max(90, n * 18);
    nodes.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      positions.set(id, { x: r * Math.cos(angle), y: r * Math.sin(angle) });
    });
  } else {
    // Two concentric rings
    const inner = Math.ceil(n / 2);
    const outer = n - inner;
    const r1 = 80, r2 = 160;
    nodes.slice(0, inner).forEach((id, i) => {
      const angle = (2 * Math.PI * i) / inner - Math.PI / 2;
      positions.set(id, { x: r1 * Math.cos(angle), y: r1 * Math.sin(angle) });
    });
    nodes.slice(inner).forEach((id, i) => {
      const angle = (2 * Math.PI * i) / outer - Math.PI / 2;
      positions.set(id, { x: r2 * Math.cos(angle), y: r2 * Math.sin(angle) });
    });
  }
  return positions;
}

export default function GraphViz({ graph }: Props) {
  const { nodes, edges, directed, nodeHighlights } = graph;

  const positions = useMemo(() => computeLayout(nodes), [nodes]);

  // Compute SVG bounding box
  const allX = [...positions.values()].map(p => p.x);
  const allY = [...positions.values()].map(p => p.y);
  const minX = Math.min(...allX, 0) - NODE_R - 20;
  const maxX = Math.max(...allX, 0) + NODE_R + 20;
  const minY = Math.min(...allY, 0) - NODE_R - 20;
  const maxY = Math.max(...allY, 0) + NODE_R + 20;
  const vbW  = maxX - minX;
  const vbH  = maxY - minY;

  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-600 font-mono text-sm">
        Empty graph
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
      <div className="text-xs font-mono text-slate-400">
        Graph ({nodes.length} nodes · {edges.length} edges · {directed ? 'directed' : 'undirected'})
      </div>

      <svg
        viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
        style={{ width: '100%', maxHeight: 420, overflow: 'visible' }}
        aria-label="Graph visualization"
        role="img"
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6"
            refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#475569" />
          </marker>
          <marker id="arrowhead-active" markerWidth="8" markerHeight="6"
            refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = positions.get(edge.from);
          const to   = positions.get(edge.to);
          if (!from || !to) return null;

          // Shorten line so it doesn't overlap node circles
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const shrink = directed ? NODE_R + 8 : NODE_R;
          const x1 = from.x + (dx / dist) * NODE_R;
          const y1 = from.y + (dy / dist) * NODE_R;
          const x2 = to.x   - (dx / dist) * shrink;
          const y2 = to.y   - (dy / dist) * shrink;

          // Offset bidirectional edges slightly so they don't overlap
          const hasBoth = directed && edges.some(e => e.from === edge.to && e.to === edge.from);
          const offset  = hasBoth ? 6 : 0;
          const nx = -dy / dist * offset;
          const ny =  dx / dist * offset;

          return (
            <motion.line
              key={`edge-${i}`}
              x1={x1 + nx} y1={y1 + ny}
              x2={x2 + nx} y2={y2 + ny}
              stroke="#334155"
              strokeWidth={1.5}
              markerEnd={directed ? 'url(#arrowhead)' : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(id => {
          const pos  = positions.get(id);
          if (!pos) return null;
          const hl   = nodeHighlights?.[id];
          const style = hl ? getHighlightStyle(hl) : null;

          return (
            <g key={`node-${id}`}>
              {hl && style && style.glow !== 'none' && (
                <motion.circle
                  cx={pos.x} cy={pos.y} r={NODE_R + 6}
                  fill="none"
                  stroke={style.border}
                  strokeWidth={1.5}
                  opacity={0.4}
                  animate={{ r: [NODE_R + 4, NODE_R + 9, NODE_R + 4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              <motion.circle
                cx={pos.x} cy={pos.y} r={NODE_R}
                animate={{
                  fill:   style ? style.bg     : '#1e293b',
                  stroke: style ? style.border : '#475569',
                  filter: style && style.glow !== 'none'
                    ? `drop-shadow(0 0 6px ${style.border})`
                    : 'none',
                }}
                strokeWidth={2}
                transition={{ duration: 0.25 }}
              />
              <text
                x={pos.x} y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: String(id).length > 2 ? 10 : 13,
                  fill: style ? style.text : '#94a3b8',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
        <span>○ unvisited</span>
        <span style={{ color: '#f59e0b' }}>◉ visiting</span>
        <span style={{ color: '#22c55e' }}>◉ visited</span>
        <span style={{ color: '#3b82f6' }}>◉ current</span>
      </div>
    </div>
  );
}
