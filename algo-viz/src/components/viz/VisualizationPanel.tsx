import { motion } from 'framer-motion';
import type { Frame } from '../../types';
import ArrayViz      from './ArrayViz';
import MatrixViz     from './MatrixViz';
import TreeViz       from './TreeViz';
import DPTableViz    from './DPTableViz';
import HashMapViz    from './HashMapViz';
import HeapViz       from './HeapViz';
import CallStackViz  from './CallStackViz';
import LinkedListViz from './LinkedListViz';
import GraphViz      from './GraphViz';

interface Props { frame: Frame | null }

// ─── Layout primitives ────────────────────────────────────────────────────────
// Defined at module level so React never re-creates them during render.

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="px-3 py-1 bg-slate-900/60 border-b border-slate-800 flex-shrink-0">
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{title}</span>
    </div>
  );
}

function Section({
  title, children, style,
}: {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="flex flex-col min-h-0 overflow-auto" style={style}>
      <SectionLabel title={title} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

function Anim({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.div key={id} className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {children}
    </motion.div>
  );
}

const HALF  = { height: '48%' } as const;
const HALF_A = { height: '42%' } as const;
const HALF_B = { height: '50%' } as const;
const HALF_C = { height: '55%' } as const;

// ─── Main panel ───────────────────────────────────────────────────────────────
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

  const {
    matrix, tree, linkedList, graph,
    dpTable, heap, arrays, hashmap, callStack,
  } = frame;

  const hasArrays    = !!(arrays?.length);
  const hasCallStack = !!(callStack?.length);

  // Matrix
  if (matrix) return <Anim id="matrix"><MatrixViz matrix={matrix} /></Anim>;

  // Tree
  if (tree) return <Anim id="tree"><TreeViz tree={tree} /></Anim>;

  // Linked list — optionally with call stack
  if (linkedList) {
    if (hasCallStack) return (
      <Anim id="ll-cs">
        <div className="h-full flex flex-col">
          <Section title="Linked List" style={HALF_B}><LinkedListViz list={linkedList} /></Section>
          <Section title="Call Stack" style={{ flex: 1 }}><CallStackViz callStack={callStack!} /></Section>
        </div>
      </Anim>
    );
    return <Anim id="ll"><LinkedListViz list={linkedList} /></Anim>;
  }

  // Adjacency-list graph — optionally with call stack
  if (graph) {
    if (hasCallStack) return (
      <Anim id="graph-cs">
        <div className="h-full flex flex-col">
          <Section title="Graph" style={HALF_C}><GraphViz graph={graph} /></Section>
          <Section title="Call Stack" style={{ flex: 1 }}><CallStackViz callStack={callStack!} /></Section>
        </div>
      </Anim>
    );
    return <Anim id="graph"><GraphViz graph={graph} /></Anim>;
  }

  // DP table (standalone)
  if (dpTable && !hasArrays) return <Anim id="dp"><DPTableViz dpTable={dpTable} /></Anim>;

  // Heap (standalone)
  if (heap && !hasArrays) return <Anim id="heap"><HeapViz heap={heap} /></Anim>;

  // Call stack + arrays (recursion / backtracking with array state)
  if (hasCallStack && hasArrays) return (
    <Anim id="cs-arr">
      <div className="h-full flex flex-col">
        <Section title="Variables" style={HALF_A}><ArrayViz arrays={arrays!} /></Section>
        <Section title="Call Stack" style={{ flex: 1 }}><CallStackViz callStack={callStack!} /></Section>
      </div>
    </Anim>
  );

  // Call stack only (pure recursion — no visualizable arrays in scope)
  if (hasCallStack) return <Anim id="cs"><CallStackViz callStack={callStack!} /></Anim>;

  // Arrays + HashMap (e.g. Two Sum, Group Anagrams)
  if (hasArrays && hashmap) return (
    <Anim id="arr-hm">
      <div className="h-full flex flex-col">
        <Section title="Array" style={HALF}><ArrayViz arrays={arrays!} /></Section>
        <Section title="HashMap" style={{ flex: 1 }}><HashMapViz hashmap={hashmap} /></Section>
      </div>
    </Anim>
  );

  // Arrays + Heap (K largest, heap sort input)
  if (hasArrays && heap) return (
    <Anim id="arr-heap">
      <div className="h-full flex flex-col">
        <Section title="Input" style={{ height: '38%' }}><ArrayViz arrays={arrays!} /></Section>
        <Section title="Heap" style={{ flex: 1 }}><HeapViz heap={heap} /></Section>
      </div>
    </Anim>
  );

  // Arrays only
  if (hasArrays) return <Anim id="arr"><ArrayViz arrays={arrays!} /></Anim>;

  // HashMap only
  if (hashmap) return <Anim id="hm"><HashMapViz hashmap={hashmap} /></Anim>;

  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-slate-600 font-mono text-xs">No visualization data</p>
    </div>
  );
}
