# AlgoViz — Algorithm Visualizer

A beautiful, interactive step-by-step visualization platform for studying algorithms and data structures. Built with React + TypeScript + Vite + Tailwind CSS.

## What It Visualizes

| Category | Algorithms |
|---|---|
| **Arrays** | Bubble Sort, Linear Search |
| **Binary Search** | Classic Binary Search (lo/mid/hi pointers) |
| **Two Pointers** | Two Sum (sorted array) |
| **Sliding Window** | Maximum Subarray Sum (fixed window) |
| **Hash Maps** | Two Sum (HashMap), Group Anagrams |
| **Graphs / Grids** | Number of Islands (BFS), DFS Path Finding |
| **Trees** | Level Order BFS, DFS Inorder, BST Insert |
| **Recursion** | Fibonacci call tree |
| **Backtracking** | Subsets, Permutations |
| **Heaps** | Heap Sort (max-heap), K Largest Elements |
| **1D DP** | Climbing Stairs, Coin Change |
| **2D DP** | Longest Common Subsequence, Unique Paths |

## Features

- **Line-by-line code highlighting** — the current executing line is highlighted as you step through
- **Animated data structures** — cells, nodes, and edges animate smoothly with color-coded states
- **Color-coded states** — current (blue), visiting (amber), visited (green), found (emerald), path (cyan), sorted (lime), comparing (purple), excluded (gray), etc.
- **Playback controls** — play/pause, step forward/back, jump to start/end, scrub progress bar
- **5 speed settings** — 0.25× to 4×
- **Call stack visualization** — for recursion/backtracking, shows the full call tree with depth indentation
- **DP table fills** — watch the dp table fill cell by cell with highlighted dependencies
- **Heap tree + array** — dual view showing heap as binary tree and underlying array simultaneously
- **HashMap entries** — animated insertion/lookup with key-value display

## Getting Started

```bash
cd algo-viz
npm install
npm run dev
```

Visit http://localhost:5173

## Project Structure

```
src/
  algorithms/       # Frame generators (one per algorithm)
    arrays/         # Bubble Sort, Linear Search
    searching/      # Binary Search, Two Pointers, Sliding Window
    hashmaps/       # Two Sum, Group Anagrams
    graphs/         # BFS/DFS grid traversal
    trees/          # BFS, DFS, BST
    recursion/      # Fibonacci, Subsets, Permutations
    dp/             # Climbing Stairs, Coin Change, LCS, Unique Paths
    heaps/          # Heap Sort, K Largest
  components/
    viz/            # Visualization renderers (SVG + Framer Motion)
    layout/         # Sidebar, CodePanel, PlaybackControls
  store/            # Zustand global state
  types/            # TypeScript types (Frame, DataStructure states)
```

## How It Works

Every algorithm is implemented as a plain function that produces an array of **Frames**. Each Frame contains:
- `line` — which line of code is executing
- `description` — a human-readable explanation
- `arrays / matrix / tree / dpTable / heap / hashmap / callStack` — the full state of every data structure at that moment

The UI renders the current frame, animating state changes between frames using Framer Motion.
