import type { Algorithm, Frame, MatrixState } from '../../types';

// ─── BFS on Grid (Number of Islands) ──────────────────────────────────────────
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
  const islandColors: Array<'path' | 'source' | 'target' | 'result' | 'visiting'> = ['path', 'source', 'target', 'result', 'visiting'];

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
          frames.push(snap([{ row, col, color: islandColor }], visited, `BFS: processing (${row},${col})`, 14));

          const dirs: [number, number][] = [[1,0],[-1,0],[0,1],[0,-1]];
          for (const [dr, dc] of dirs) {
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '1') {
              frames.push(snap([{ row, col, color: islandColor }, { row: nr, col: nc, color: 'comparing' }], visited,
                `Neighbor (${nr},${nc})='1', enqueue`, 19));
              grid[nr][nc] = '0';
              visited[nr][nc] = true;
              queue.push([nr, nc]);
            }
          }
        }
        frames.push(snap([], visited, `Island #${count} fully explored`, 22));
      }
    }
  }

  frames.push(snap([], visited, `Done! Total islands = ${count}`, 12));
  return frames;
}

// ─── DFS on Grid (Path Finding) ───────────────────────────────────────────────
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
    line, description: desc,
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

  frames.push(snap([], `DFS path from (${start}) to (${end})`, 1));

  function dfs(r: number, c: number): boolean {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === 1 || visited[r][c]) return false;

    visited[r][c] = true;
    path.push([r, c]);
    frames.push(snap([{ row: r, col: c, color: 'visiting' }], `Visit (${r},${c}), path length=${path.length}`, 8));

    if (r === end[0] && c === end[1]) {
      frames.push(snap([{ row: r, col: c, color: 'found' }], `Reached destination! Path found!`, 11));
      return true;
    }

    const dirs: [number, number][] = [[0,1],[1,0],[0,-1],[-1,0]];
    for (const [dr, dc] of dirs) {
      if (dfs(r + dr, c + dc)) return true;
    }

    path.pop();
    frames.push(snap([{ row: r, col: c, color: 'excluded' }], `Backtrack from (${r},${c})`, 18));
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
    description: 'Count connected components of \'1\'s: for each unvisited land cell, BFS marks the entire island.',
    complexity: {
      time: 'O(m × n)',
      space: 'O(min(m, n))',
      reasoning:
        'Every cell is visited at most once — the outer loops touch all m×n cells and BFS only processes cells that are still \'1\' (marking them \'0\' immediately to prevent re-visits). Total work is proportional to the grid size: O(m×n). The BFS queue holds at most min(m, n) elements at once (the maximum "frontier" width along a diagonal), giving that space bound. If we count the visited array it\'s O(m×n) space.',
    },
    codes: {
      javascript: `function numIslands(grid) {
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
}`,
      typescript: `function numIslands(grid: string[][]): number {
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

function bfs(grid: string[][], r: number, c: number): void {
  const queue: [number, number][] = [[r, c]];
  grid[r][c] = '0';

  while (queue.length) {
    const [row, col] = queue.shift()!;
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
}`,
      python: `def num_islands(grid):
    count = 0

    def bfs(r, c):
        queue = [(r, c)]
        grid[r][c] = '0'          # mark visited
        while queue:
            row, col = queue.pop(0)
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = row + dr, col + dc
                if (0 <= nr < len(grid) and
                    0 <= nc < len(grid[0]) and
                    grid[nr][nc] == '1'):
                    grid[nr][nc] = '0'
                    queue.append((nr, nc))

    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == '1':
                count += 1
                bfs(r, c)
    return count`,
      java: `public int numIslands(char[][] grid) {
    int count = 0;
    int rows = grid.length, cols = grid[0].length;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1') {
                count++;
                bfs(grid, r, c, rows, cols);
            }
        }
    }
    return count;
}

private void bfs(char[][] grid, int r, int c, int rows, int cols) {
    Queue<int[]> queue = new LinkedList<>();
    queue.offer(new int[]{r, c});
    grid[r][c] = '0';

    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
    while (!queue.isEmpty()) {
        int[] cell = queue.poll();
        for (int[] d : dirs) {
            int nr = cell[0]+d[0], nc = cell[1]+d[1];
            if (nr>=0 && nr<rows && nc>=0 && nc<cols
                    && grid[nr][nc]=='1') {
                grid[nr][nc] = '0';
                queue.offer(new int[]{nr, nc});
            }
        }
    }
}`,
      c: `void bfs(char grid[][5], int rows, int cols, int r, int c) {
    int qr[100], qc[100], head=0, tail=0;
    qr[tail]=r; qc[tail++]=c;
    grid[r][c]='0';
    int dr[]={1,-1,0,0}, dc[]={0,0,1,-1};
    while (head < tail) {
        int row=qr[head], col=qc[head++];
        for (int d=0; d<4; d++) {
            int nr=row+dr[d], nc=col+dc[d];
            if (nr>=0 && nr<rows && nc>=0 && nc<cols
                    && grid[nr][nc]=='1') {
                grid[nr][nc]='0';
                qr[tail]=nr; qc[tail++]=nc;
            }
        }
    }
}

int numIslands(char grid[][5], int rows, int cols) {
    int count = 0;
    for (int r=0; r<rows; r++)
        for (int c=0; c<cols; c++)
            if (grid[r][c]=='1') { count++; bfs(grid,rows,cols,r,c); }
    return count;
}`,
    },
    lineMap: {
      typescript: { 1: 1, 5: 5, 7: 7, 14: 15, 19: 19, 22: 22 },
      python:     { 1: 1, 5: 17, 7: 19, 14: 7, 19: 10, 22: 22 },
      java:       { 1: 1, 5: 5, 7: 7, 14: 15, 19: 21, 22: 24 },
      c:          { 1: 18, 5: 20, 7: 21, 14: 5, 19: 9, 22: 14 },
    },
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
    description: 'DFS explores as deep as possible; if a path hits a dead end, it backtracks and tries the next direction.',
    complexity: {
      time: 'O(m × n)',
      space: 'O(m × n)',
      reasoning:
        'In the worst case DFS explores every cell in the grid once, touching all m×n cells — O(m×n) time. The recursion call stack depth is bounded by the path length which can be at most m×n (a snake that visits every cell), giving O(m×n) space. The visited array also contributes O(m×n) space. In practice, obstacles make the actual path much shorter.',
    },
    codes: {
      javascript: `function dfsPath(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const visited = Array.from({length:rows},()=>Array(cols).fill(false));
  const path = [];

  function dfs(r, c) {
    if (r<0||r>=rows||c<0||c>=cols) return false;
    if (grid[r][c]===1||visited[r][c])  return false;

    visited[r][c] = true;
    path.push([r, c]);

    if (r===end[0]&&c===end[1]) return true;

    const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
    for (const [dr, dc] of dirs) {
      if (dfs(r+dr, c+dc)) return true;
    }

    path.pop(); // backtrack
    return false;
  }

  dfs(start[0], start[1]);
  return path;
}`,
      typescript: `function dfsPath(
  grid: number[][], start: [number,number], end: [number,number]
): [number,number][] {
  const rows = grid.length, cols = grid[0].length;
  const visited = Array.from({length:rows},()=>Array(cols).fill(false));
  const path: [number,number][] = [];

  function dfs(r: number, c: number): boolean {
    if (r<0||r>=rows||c<0||c>=cols) return false;
    if (grid[r][c]===1||visited[r][c])  return false;

    visited[r][c] = true;
    path.push([r, c]);

    if (r===end[0]&&c===end[1]) return true;

    const dirs: [number,number][] = [[0,1],[1,0],[0,-1],[-1,0]];
    for (const [dr, dc] of dirs) {
      if (dfs(r+dr, c+dc)) return true;
    }

    path.pop(); // backtrack
    return false;
  }

  dfs(start[0], start[1]);
  return path;
}`,
      python: `def dfs_path(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    visited = [[False]*cols for _ in range(rows)]
    path = []

    def dfs(r, c):
        if not (0<=r<rows and 0<=c<cols): return False
        if grid[r][c]==1 or visited[r][c]:  return False

        visited[r][c] = True
        path.append((r, c))

        if (r, c) == end: return True

        for dr, dc in [(0,1),(1,0),(0,-1),(-1,0)]:
            if dfs(r+dr, c+dc): return True

        path.pop()          # backtrack
        return False

    dfs(*start)
    return path`,
      java: `public List<int[]> dfsPath(int[][] grid, int[] start, int[] end) {
    int rows = grid.length, cols = grid[0].length;
    boolean[][] visited = new boolean[rows][cols];
    List<int[]> path = new ArrayList<>();

    dfs(grid, visited, path, start[0], start[1],
        end[0], end[1], rows, cols);
    return path;
}

private boolean dfs(int[][] grid, boolean[][] visited,
        List<int[]> path, int r, int c,
        int er, int ec, int rows, int cols) {
    if (r<0||r>=rows||c<0||c>=cols) return false;
    if (grid[r][c]==1||visited[r][c])  return false;

    visited[r][c] = true;
    path.add(new int[]{r, c});

    if (r==er&&c==ec) return true;

    int[][] dirs = {{0,1},{1,0},{0,-1},{-1,0}};
    for (int[] d : dirs)
        if (dfs(grid,visited,path,r+d[0],c+d[1],er,ec,rows,cols))
            return true;

    path.remove(path.size()-1); // backtrack
    return false;
}`,
      c: `int dfs(int grid[][5], int vis[][5], int path[][2],
        int *plen, int r, int c, int er, int ec,
        int rows, int cols) {
    if (r<0||r>=rows||c<0||c>=cols) return 0;
    if (grid[r][c]==1||vis[r][c])   return 0;

    vis[r][c]=1;
    path[*plen][0]=r; path[(*plen)++][1]=c;

    if (r==er&&c==ec) return 1;

    int dr[]={0,1,0,-1}, dc[]={1,0,-1,0};
    for (int d=0;d<4;d++)
        if (dfs(grid,vis,path,plen,r+dr[d],c+dc[d],er,ec,rows,cols))
            return 1;

    (*plen)--;    /* backtrack */
    return 0;
}`,
    },
    lineMap: {
      typescript: { 1: 1, 8: 8, 11: 13, 18: 20, 22: 26 },
      python:     { 1: 1, 8: 6, 11: 9, 18: 13, 22: 20 },
      java:       { 1: 1, 8: 13, 11: 18, 18: 24, 22: 27 },
      c:          { 1: 1, 8: 1, 11: 6, 18: 12, 22: 16 },
    },
    defaultInput: {
      grid: [[0,0,0,0,0],[0,1,1,0,0],[0,0,0,1,0],[0,1,0,0,0],[0,0,0,0,0]],
      start: [0, 0],
      end: [4, 4],
    },
    generate: generateDFSPath,
  },
];
