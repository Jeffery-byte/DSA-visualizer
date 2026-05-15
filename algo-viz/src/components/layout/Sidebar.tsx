import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { algorithmGroups } from '../../algorithms';
import { useStore } from '../../store';

export default function Sidebar() {
  const { selectedAlgorithm, selectAlgorithm } = useStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['arrays']));

  const toggleGroup = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalAlgorithms = algorithmGroups.reduce((acc, g) => acc + g.algorithms.length, 0);

  return (
    <aside
      className="w-64 flex-shrink-0 bg-slate-900/80 border-r border-slate-800 flex flex-col h-full overflow-hidden"
      aria-label="Algorithm categories"
    >
      {/* Brand */}
      <div className="px-4 py-4 border-b border-slate-800">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AlgoViz
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Algorithm Visualizer</p>
      </div>

      {/* Category list */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Algorithms">
        {algorithmGroups.map((group) => (
          <div key={group.id}>
            <button
              onClick={() => toggleGroup(group.id)}
              aria-expanded={expanded.has(group.id)}
              aria-controls={`group-${group.id}`}
              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-slate-800/60 transition-colors"
            >
              <span className="text-base w-5 text-center text-slate-400 font-mono" aria-hidden="true">
                {group.icon}
              </span>
              <span className="text-xs font-semibold text-slate-300 flex-1 uppercase tracking-wide">
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: expanded.has(group.id) ? 0 : -90 }}
                transition={{ duration: 0.15 }}
                aria-hidden="true"
              >
                <ChevronDown size={12} className="text-slate-500" />
              </motion.span>
            </button>

            <AnimatePresence>
              {expanded.has(group.id) && (
                <motion.div
                  id={`group-${group.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {group.algorithms.map((algo) => {
                    const isSelected = selectedAlgorithm?.id === algo.id;
                    return (
                      <motion.button
                        key={algo.id}
                        onClick={() => selectAlgorithm(algo)}
                        aria-current={isSelected ? 'true' : undefined}
                        whileHover={{ x: 2 }}
                        className={`w-full text-left pl-11 pr-4 py-2 text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 text-blue-300 border-r-2 border-blue-500'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="font-medium">{algo.name}</div>
                        <div className="text-slate-600 text-[10px] mt-0.5 leading-tight line-clamp-2">
                          {algo.description}
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">
          {totalAlgorithms} algorithms visualized
        </p>
      </div>
    </aside>
  );
}
