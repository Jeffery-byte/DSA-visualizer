import { create } from 'zustand';
import type { Frame, Algorithm, Language } from '../types';
import { allAlgorithms } from '../algorithms';

export type AppMode = 'library' | 'custom';

interface VisualizationStore {
  // ── Mode ────────────────────────────────────────────────────────────────────
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // ── Library mode ─────────────────────────────────────────────────────────────
  selectedAlgorithm: Algorithm | null;
  selectedLanguage: Language;
  setLanguage: (lang: Language) => void;
  selectAlgorithm: (algo: Algorithm) => void;

  // ── Shared playback ──────────────────────────────────────────────────────────
  frames: Frame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  speed: number;

  goToFrame: (index: number) => void;
  nextFrame: () => void;
  prevFrame: () => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;

  /** Called by CustomCodePage to load frames from user code execution. */
  setCustomFrames: (frames: Frame[]) => void;

  // ── UI ───────────────────────────────────────────────────────────────────────
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<VisualizationStore>((set, get) => ({
  mode: 'library',
  setMode: (mode) => set({ mode, currentFrameIndex: 0, isPlaying: false }),

  selectedAlgorithm: allAlgorithms[0] ?? null,
  frames: allAlgorithms[0]?.generate(allAlgorithms[0].defaultInput ?? {}) ?? [],
  currentFrameIndex: 0,
  isPlaying: false,
  speed: 600,
  selectedLanguage: 'javascript',
  sidebarOpen: true,

  selectAlgorithm: (algo) => {
    const frames = algo.generate(algo.defaultInput ?? {});
    set({ selectedAlgorithm: algo, frames, currentFrameIndex: 0, isPlaying: false });
  },

  setLanguage: (lang) => set({ selectedLanguage: lang }),

  setCustomFrames: (frames) => set({ frames, currentFrameIndex: 0, isPlaying: false }),

  goToFrame: (index) => {
    const { frames } = get();
    set({ currentFrameIndex: Math.max(0, Math.min(index, frames.length - 1)) });
  },

  nextFrame: () => {
    const { currentFrameIndex, frames } = get();
    if (currentFrameIndex >= frames.length - 1) {
      set({ isPlaying: false });
    } else {
      set({ currentFrameIndex: currentFrameIndex + 1 });
    }
  },

  prevFrame: () => {
    const { currentFrameIndex } = get();
    if (currentFrameIndex > 0) set({ currentFrameIndex: currentFrameIndex - 1 });
  },

  setPlaying:    (playing) => set({ isPlaying: playing }),
  setSpeed:      (speed)   => set({ speed }),
  reset:         ()        => set({ currentFrameIndex: 0, isPlaying: false }),
  toggleSidebar: ()        => set(s => ({ sidebarOpen: !s.sidebarOpen })),
}));
