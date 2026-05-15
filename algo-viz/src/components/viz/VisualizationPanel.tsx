import { motion } from 'framer-motion';
import type { Frame } from '../../types';
import ArrayViz from './ArrayViz';
import MatrixViz from './MatrixViz';
import TreeViz from './TreeViz';
import DPTableViz from './DPTableViz';
import HashMapViz from './HashMapViz';
import HeapViz from './HeapViz';
import CallStackViz from './CallStackViz';

interface Props {
  frame: Frame | null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-0">
      <div className="px-3 py-1 bg-slate-900/60 border-b border-slate-800">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

export default function VisualizationPanel({ frame }: Props) {
  if (!frame) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl opacity-20">⊞</div>
          <p className="text-slate-600 font-mono text-sm">Select an algorithm to begin</p>
        </div>
      </div>
    );
  }

  const hasMatrix = !!frame.matrix;
  const hasTree = !!frame.tree;
  const hasDPTable = !!frame.dpTable;
  const hasHeap = !!frame.heap;
  const hasArrays = !!(frame.arrays && frame.arrays.length > 0);
  const hasHashmap = !!frame.hashmap;
  const hasCallStack = !!(frame.callStack);

  // ─── Matrix (Graphs / Grid problems) ─────────────────────────────────────────
  if (hasMatrix) {
    return (
        <motion.div key="matrix" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <MatrixViz matrix={frame.matrix!} />
        </motion.div>
      );
  }

  // ─── Trees ───────────────────────────────────────────────────────────────────
  if (hasTree) {
    return (
        <motion.div key="tree" className="h-full overflow-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TreeViz tree={frame.tree!} />
        </motion.div>
      );
  }

  // ─── DP Table ─────────────────────────────────────────────────────────────────
  if (hasDPTable && !hasArrays) {
    return (
        <motion.div key="dp" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <DPTableViz dpTable={frame.dpTable!} />
        </motion.div>
      );
  }

  // ─── Heap (standalone) ───────────────────────────────────────────────────────
  if (hasHeap && !hasArrays) {
    return (
        <motion.div key="heap" className="h-full overflow-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <HeapViz heap={frame.heap!} />
        </motion.div>
      );
  }

  // ─── Recursion / Backtracking: call stack + arrays ────────────────────────────
  if (hasCallStack && (frame.callStack!.length > 0 || hasArrays)) {
    return (
        <motion.div key="callstack" className="h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {hasArrays && (
            <div className="flex-shrink-0 border-b border-slate-800" style={{ height: '40%' }}>
              <Section title="State">
                <ArrayViz arrays={frame.arrays!} />
              </Section>
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-auto">
            <Section title="Call Stack">
              <CallStackViz callStack={frame.callStack!} />
            </Section>
          </div>
        </motion.div>
      );
  }

  // ─── Hashmap + Array (side by side) ──────────────────────────────────────────
  if (hasHashmap && hasArrays) {
    return (
        <motion.div key="hashmap-array" className="h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex-shrink-0 border-b border-slate-800" style={{ height: '45%' }}>
            <Section title="Array">
              <ArrayViz arrays={frame.arrays!} />
            </Section>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <Section title="HashMap">
              <HashMapViz hashmap={frame.hashmap!} />
            </Section>
          </div>
        </motion.div>
      );
  }

  // ─── Standalone HashMap ───────────────────────────────────────────────────────
  if (hasHashmap) {
    return (
        <motion.div key="hashmap" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <HashMapViz hashmap={frame.hashmap!} />
        </motion.div>
      );
  }

  // ─── Heap + Array ─────────────────────────────────────────────────────────────
  if (hasHeap && hasArrays) {
    return (
        <motion.div key="heap-array" className="h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex-shrink-0 border-b border-slate-800" style={{ height: '55%' }}>
            <Section title="Input Array">
              <ArrayViz arrays={frame.arrays!} />
            </Section>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <Section title="Min-Heap">
              <HeapViz heap={frame.heap!} />
            </Section>
          </div>
        </motion.div>
      );
  }

  // ─── Arrays (default) ────────────────────────────────────────────────────────
  if (hasArrays) {
    return (
        <motion.div key="arrays" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ArrayViz arrays={frame.arrays!} />
        </motion.div>
      );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-slate-600 font-mono text-xs">No visualization data</p>
    </div>
  );
}
