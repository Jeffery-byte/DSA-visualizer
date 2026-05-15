import { motion } from 'framer-motion';
import { Menu, X, BookOpen, Code2 } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import CodePanel from './components/layout/CodePanel';
import PlaybackControls from './components/layout/PlaybackControls';
import VisualizationPanel from './components/viz/VisualizationPanel';
import CustomCodePage from './components/custom/CustomCodePage';
import { useStore } from './store';

const SIDEBAR_WIDTH = 280;

export default function App() {
  const {
    mode, setMode,
    frames, currentFrameIndex,
    selectedAlgorithm,
    sidebarOpen, toggleSidebar,
  } = useStore();

  const currentFrame = frames[currentFrameIndex] ?? null;
  const isLibrary = mode === 'library';

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center px-5 gap-4 z-10 shadow-lg">

        {isLibrary && (
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={sidebarOpen}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}

        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex-shrink-0">
            AlgoViz
          </span>
          {isLibrary && selectedAlgorithm && (
            <>
              <span className="text-slate-600 flex-shrink-0" aria-hidden="true">/</span>
              <span className="text-blue-400 font-semibold text-base truncate">{selectedAlgorithm.name}</span>
            </>
          )}
        </div>

        {/* Mode toggle */}
        <div
          className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 flex-shrink-0"
          role="tablist"
          aria-label="App mode"
        >
          {([
            { id: 'library', label: 'Library', icon: BookOpen },
            { id: 'custom',  label: 'Custom Code', icon: Code2 },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Step counter */}
        {frames.length > 0 && (
          <div className="ml-auto flex-shrink-0">
            <span
              aria-label={`Step ${currentFrameIndex + 1} of ${frames.length}`}
              className="text-sm font-mono px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
            >
              {currentFrameIndex + 1} <span className="text-slate-500">/</span> {frames.length}
            </span>
          </div>
        )}

        {/* Complexity badges */}
        {isLibrary && selectedAlgorithm?.complexity && (
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-mono px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 bg-slate-800/50">
              Time <span className="font-bold text-orange-400 ml-1">{selectedAlgorithm.complexity.time}</span>
            </span>
            <span className="text-sm font-mono px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 bg-slate-800/50">
              Space <span className="font-bold text-green-400 ml-1">{selectedAlgorithm.complexity.space}</span>
            </span>
          </div>
        )}
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Library mode */}
        {isLibrary && (
          <>
            <motion.div
              initial={false}
              animate={{ width: sidebarOpen ? SIDEBAR_WIDTH : 0, opacity: sidebarOpen ? 1 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden flex-shrink-0"
              inert={sidebarOpen ? undefined : ('' as unknown as boolean)}
            >
              <Sidebar />
            </motion.div>

            <div className="flex-1 min-w-0 flex flex-col border-r border-slate-800">
              <div className="flex-1 min-h-0 relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-5"
                  style={{ backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                />
                {selectedAlgorithm && (
                  <div className="absolute top-4 left-5 z-10">
                    <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200">
                      {selectedAlgorithm.name}
                    </span>
                  </div>
                )}
                <VisualizationPanel frame={currentFrame} />
              </div>
              <PlaybackControls />
            </div>

            <div className="w-96 xl:w-[420px] flex-shrink-0 hidden md:flex flex-col border-l border-slate-800">
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 flex-shrink-0">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Code</span>
              </div>
              <div className="flex-1 min-h-0">
                <CodePanel />
              </div>
            </div>
          </>
        )}

        {!isLibrary && <CustomCodePage />}
      </div>
    </div>
  );
}
