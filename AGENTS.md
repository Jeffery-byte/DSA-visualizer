# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

AlgoViz is a client-side React SPA (no backend, no database) for visualizing data structures and algorithms. All source code lives in the `algo-viz/` subdirectory.

### Tech stack

- React 19, TypeScript ~6, Vite 8, Tailwind CSS 4, Zustand 5, Monaco Editor, Framer Motion
- Package manager: **npm** (lockfile: `package-lock.json`)

### Development commands

All commands run from `algo-viz/`:

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | TypeScript type-check + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

### Caveats

- The app code lives in the `algo-viz/` subdirectory, **not** the repo root. Always `cd algo-viz` before running npm commands.
- There are no backend services, databases, or environment variables required. The app is entirely client-side.
- The Vite dev server uses port 5173 by default. Pass `--host 0.0.0.0` to expose it on all interfaces when running in a VM.
- Node.js v22+ is required (for Vite 8 and TypeScript 6 compatibility).
