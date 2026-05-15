import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TreeNode, TreeState } from '../../types';
import { getHighlightStyle } from './colors';

interface Props {
  tree: TreeState;
}

interface PositionedNode {
  node: TreeNode;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

const H_GAP = 40;
const V_GAP = 70;
const NODE_R = 22;

function getTreeHeight(node: TreeNode | null | undefined): number {
  if (!node) return 0;
  return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
}

function positionNodes(node: TreeNode | null | undefined, depth: number, left: number, right: number, parentX?: number, parentY?: number): PositionedNode[] {
  if (!node) return [];
  const x = (left + right) / 2;
  const y = depth * V_GAP + NODE_R + 10;
  const mid = (left + right) / 2;
  const result: PositionedNode[] = [{ node, x, y, parentX, parentY }];

  const leftWidth = (right - left) / 2;
  result.push(...positionNodes(node.left, depth + 1, left, mid - H_GAP / 4, x, y));
  result.push(...positionNodes(node.right, depth + 1, mid + H_GAP / 4, right, x, y));
  void leftWidth;
  return result;
}

export default function TreeViz({ tree }: Props) {
  const { root, highlights, queue } = tree;

  const { nodes, width, height } = useMemo(() => {
    if (!root) return { nodes: [], width: 400, height: 200 };
    const h = getTreeHeight(root);
    const leafCount = Math.pow(2, h - 1);
    const w = Math.max(400, leafCount * (NODE_R * 2 + H_GAP));
    const nodes = positionNodes(root, 0, 0, w);
    const maxY = Math.max(...nodes.map(n => n.y)) + NODE_R + 20;
    return { nodes, width: w, height: maxY };
  }, [root]);

  const highlightMap = useMemo(() => {
    const m = new Map<number, typeof highlights[0]>();
    highlights.forEach(h => m.set(h.id, h));
    return m;
  }, [highlights]);

  return (
    <div className="flex flex-col items-center gap-4 h-full overflow-auto py-4">
      {/* Queue display */}
      {queue && queue.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-xs text-slate-400 font-mono">Queue:</span>
          {queue.map((id, i) => {
            const nodeData = nodes.find(n => n.node.id === id);
            return (
              <motion.div
                key={`q-${id}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono border-2"
                style={{ backgroundColor: '#1d4ed8', borderColor: '#3b82f6', color: '#fff' }}
              >
                {nodeData?.node.val ?? id}
              </motion.div>
            );
          })}
        </div>
      )}

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Edges */}
        {nodes.map(({ node, x, y, parentX, parentY }) =>
          parentX != null && parentY != null ? (
            <motion.line
              key={`edge-${node.id}`}
              x1={parentX}
              y1={parentY}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth={2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          ) : null
        )}

        {/* Nodes */}
        {nodes.map(({ node, x, y }) => {
          const hl = highlightMap.get(node.id) ?? (node.highlight ? { id: node.id, color: node.highlight } : null);
          const style = hl ? getHighlightStyle(hl.color) : null;

          return (
            <g key={`node-${node.id}`}>
              {/* Glow ring */}
              {hl && (
                <motion.circle
                  cx={x} cy={y} r={NODE_R + 6}
                  fill="none"
                  stroke={style!.border}
                  strokeWidth={1.5}
                  opacity={0.4}
                  animate={{ r: [NODE_R + 4, NODE_R + 8, NODE_R + 4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}

              <motion.circle
                cx={x} cy={y} r={NODE_R}
                animate={{
                  fill: hl ? style!.bg : '#1e293b',
                  stroke: hl ? style!.border : '#475569',
                  filter: hl && style!.glow !== 'none' ? `drop-shadow(0 0 6px ${style!.border})` : 'none',
                }}
                strokeWidth={2}
                transition={{ duration: 0.25 }}
              />

              <text
                x={x} y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono font-bold select-none"
                style={{
                  fontSize: String(node.val).length > 2 ? 11 : 13,
                  fill: hl ? style!.text : '#94a3b8',
                  pointerEvents: 'none',
                }}
              >
                {String(node.val)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
