import type { Algorithm, Frame, MatrixState } from '../../types';

// ─── BFS on Grid (Number of Islands) ──────────────────────────────────────────
const numberOfIslandsCode = `function numIslands(grid) {
  let count = 0;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') {
        count++;
        bfs(grid, r, c);
      }
    }
  }
  return count;
}

function bfs(grid, r, c) {
  const queue = [[r, c]];
  grid[r][c] = '0'; // mark visited

  while (queue.length) {
    const [row, col] = queue.shift();
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for (const [dr, dc] of dirs) {
      const nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < grid.length &&
          nc >= 0 && nc < grid[0].length &&
          grid[nr][nc] === '1') {
        grid[nr][nc] = '0';
        queue.push([nr, nc]);
      }
    }
  }
}`;

function generateNumberOfIslands(input: Record<string, unknown>): Frame[] {
  const rawGrid = (input.grid as string[][]) ?? [
    ['1','1','0','0','0'],
    ['1','1','0','0','0'],
    ['0','0','1','0','0'],
    ['0','0','0','1','1'],
  ];
  const grid: string[][] = rawGrid.map(row => [...row]);
  const frames: Frame[] = [];
  const rows = grid.length, cols = grid[0].length;

  const snap = (highlights: MatrixState['highlights'], visited: boolean[][], description: string, line: number): Frame => ({
    line,
    description,
    matrix: {
      data: grid.map(r => r.map(c => c === '1' ? 1 : 0)),
      highlights,
      visitedCells: visited.map(r => [...r]),
    },
  });

  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

  frames.push(snap([], visited, 'Start: find all islands (connected 1s)', 1));

  let count = 0;
  const islandColors: Array<'path' | 'source' | 'target' | 'result' | 'visiting' | 'visited'> = ['path', 'source', 'target', 'result', 'visiting'];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      frames.push(snap([{ row: r, col: c, color: 'current' }], visited, `Checking cell (${r},${c}) = ${grid[r][c]}`, 5));

      if (grid[r][c] === '1') {
        count++;
        const islandColor = islandColors[(count - 1) % islandColors.length];
        frames.push(snap([{ row: r, col: c, color: 'current' }], visited, `Found island #${count}! Start BFS from (${r},${c})`, 7));

        const queue: [number, number][] = [[r, c]];
        grid[r][c] = '0';
        visited[r][c] = true;

        while (queue.length) {
          const [row, col] = queue.shift()!;
          frames.push(snap([{ row, col, color: islandColor }], visited, `BFS: processing (${row},${col})`, 19));

          const dirs: [number, number][] = [[1,0],[-1,0],[0,1],[0,-1]];
          for (const [dr, dc] of dirs) {
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '1') {
              frames.push(snap([{ row, col, color: islandColor }, { row: nr, col: nc, color: 'comparing' }], visited,
                `Neighbor (${nr},${nc})='1', add to queue`, 24));
              grid[nr][nc] = '0';
              visited[nr][nc] = true;
              queue.push([nr, nc]);
            }
          }
        }

        frames.push(snap([], visited, `Island #${count} fully explored`, 29));
      }
    }
  }

  frames.push(snap([], visited, `Done! Total islands = ${count}`, 12));
  return frames;
}

// ─── DFS on Grid (Find Path) ──────────────────────────────────────────────────
const dfsPathCode = `function dfsPath(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const visited = Array.from({length:rows},()=>Array(cols).fill(false));
  const path = [];

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (grid[r][c] === 1 || visited[r][c]) return false;

    visited[r][c] = true;
    path.push([r, c]);

    if (r === end[0] && c === end[1]) return true;

    const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
    for (const [dr, dc] of dirs) {
      if (dfs(r + dr, c + dc)) return true;
    }

    path.pop(); // backtrack
    return false;
  }

  dfs(start[0], start[1]);
  return path;
}`;

function generateDFSPath(input: Record<string, unknown>): Frame[] {
  const rawGrid = (input.grid as number[][]) ?? [
    [0,0,0,0,0],
    [0,1,1,0,0],
    [0,0,0,1,0],
    [0,1,0,0,0],
    [0,0,0,0,0],
  ];
  const grid: number[][] = rawGrid.map(r => [...r]);
  const start: [number, number] = (input.start as [number, number]) ?? [0, 0];
  const end: [number, number] = (input.end as [number, number]) ?? [4, 4];
  const frames: Frame[] = [];
  const rows = grid.length, cols = grid[0].length;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const path: [number, number][] = [];

  const snap = (highlights: MatrixState['highlights'], desc: string, line: number): Frame => ({
    line,
    description: desc,
    matrix: {
      data: grid.map(r => [...r]),
      highlights: [
        { row: start[0], col: start[1], color: 'source' },
        { row: end[0], col: end[1], color: 'target' },
        ...highlights,
      ],
      visitedCells: visited.map(r => [...r]),
      pathCells: [...path],
    },
  });

  frames.push(snap([], `DFS: find path from (${start}) to (${end})`, 1));

  function dfs(r: number, c: number): boolean {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === 1 || visited[r][c]) return false;

    visited[r][c] = true;
    path.push([r, c]);
    frames.push(snap([{ row: r, col: c, color: 'visiting' }], `Visit (${r},${c}), path length=${path.length}`, 9));

    if (r === end[0] && c === end[1]) {
      frames.push(snap([{ row: r, col: c, color: 'found' }], `Reached destination! Path found!`, 13));
      return true;
    }

    const dirs: [number, number][] = [[0,1],[1,0],[0,-1],[-1,0]];
    for (const [dr, dc] of dirs) {
      if (dfs(r + dr, c + dc)) return true;
    }

    path.pop();
    frames.push(snap([{ row: r, col: c, color: 'excluded' }], `Backtrack from (${r},${c})`, 19));
    return false;
  }

  dfs(start[0], start[1]);
  frames.push(snap([], path.length ? `Path found with ${path.length} steps!` : 'No path found', 22));
  return frames;
}

export const graphAlgorithms: Algorithm[] = [
  {
    id: 'number-of-islands',
    name: 'Number of Islands (BFS)',
    category: 'graphs',
    description: 'BFS to count connected components of 1s in a binary grid.',
    code: numberOfIslandsCode,
    defaultInput: {
      grid: [
        ['1','1','0','0','0'],
        ['1','1','0','0','0'],
        ['0','0','1','0','0'],
        ['0','0','0','1','1'],
      ],
    },
    generate: generateNumberOfIslands,
  },
  {
    id: 'dfs-path',
    name: 'DFS Path Finding',
    category: 'graphs',
    description: 'DFS to find a path through a grid with obstacles (backtracking).',
    code: dfsPathCode,
    defaultInput: {
      grid: [
        [0,0,0,0,0],
        [0,1,1,0,0],
        [0,0,0,1,0],
        [0,1,0,0,0],
        [0,0,0,0,0],
      ],
      start: [0, 0],
      end: [4, 4],
    },
    generate: generateDFSPath,
  },
];
