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
      className="flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden"
      style={{ width: 280 }}
      aria-label="Algorithm categories"
    >
      {/* Brand section */}
      <div className="px-5 py-5 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AlgoViz
        </h1>
        <p className="text-sm text-slate-500 mt-1">Algorithm Visualizer</p>
      </div>

      {/* Algorithm list */}
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Algorithms">
        {algorithmGroups.map((group) => (
          <div key={group.id}>
            <button
              onClick={() => toggleGroup(group.id)}
              aria-expanded={expanded.has(group.id)}
              aria-controls={`group-${group.id}`}
              className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-800/60 transition-colors"
            >
              <span className="text-base w-6 text-center text-slate-400 font-mono flex-shrink-0" aria-hidden="true">
                {group.icon}
              </span>
              <span className="text-sm font-semibold text-slate-300 flex-1 uppercase tracking-wide">
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: expanded.has(group.id) ? 0 : -90 }}
                transition={{ duration: 0.15 }}
                aria-hidden="true"
              >
                <ChevronDown size={14} className="text-slate-500" />
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
                        whileHover={{ x: 3 }}
                        className={`w-full text-left pl-14 pr-5 py-2.5 text-sm transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 text-blue-300 border-r-2 border-blue-500'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="font-medium">{algo.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5 leading-snug line-clamp-2">
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

      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-600 text-center">
          {totalAlgorithms} algorithms · 12 categories
        </p>
      </div>
    </aside>
  );
}
