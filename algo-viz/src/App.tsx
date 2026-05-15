import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import CodePanel from './components/layout/CodePanel';
import PlaybackControls from './components/layout/PlaybackControls';
import VisualizationPanel from './components/viz/VisualizationPanel';
import { useStore } from './store';

export default function App() {
  const { frames, currentFrameIndex, selectedAlgorithm, sidebarOpen, toggleSidebar } = useStore();
  const currentFrame = frames[currentFrameIndex] ?? null;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 h-12 bg-slate-900/90 border-b border-slate-800 flex items-center px-4 gap-3 z-10">
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="text-slate-500 hidden sm:block">AlgoViz</span>
          {selectedAlgorithm && (
            <>
              <span className="text-slate-700 hidden sm:block">/</span>
              <span className="text-blue-400 font-semibold truncate">{selectedAlgorithm.name}</span>
            </>
          )}
        </div>

        {/* Step badge */}
        {frames.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-1 rounded-md bg-slate-800 text-slate-400">
              {currentFrameIndex + 1} / {frames.length}
            </span>
          </div>
        )}

        {/* Complexity badges */}
        {selectedAlgorithm?.complexity && (
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 text-slate-400">
              Time <span className="font-bold" style={{ color: "#f97316" }}>{selectedAlgorithm.complexity.time}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 text-slate-400">
              Space <span className="font-bold" style={{ color: "#22c55e" }}>{selectedAlgorithm.complexity.space}</span>
            </span>
          </div>
        )}
      </header>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: sidebarOpen ? 256 : 0, opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden flex-shrink-0"
          style={{ minWidth: 0 }}
        >
          <Sidebar />
        </motion.div>

        {/* Center: Visualization */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-slate-800">
          {/* Viz area */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            {/* Background grid pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-5"
              style={{
                backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Algorithm name overlay */}
            {selectedAlgorithm && (
              <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300">
                  {selectedAlgorithm.name}
                </span>
              </div>
            )}

            <VisualizationPanel frame={currentFrame} />
          </div>

          {/* Playback controls */}
          <PlaybackControls />
        </div>

        {/* Right: Code panel */}
        <div className="w-80 xl:w-96 flex-shrink-0 hidden md:flex flex-col">
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex-shrink-0">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Code</span>
          </div>
          <div className="flex-1 min-h-0">
            <CodePanel />
          </div>
        </div>
      </div>
    </div>
  );
}
