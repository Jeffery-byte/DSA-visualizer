import type { Algorithm, Frame, TreeNode, TreeState } from '../../types';

let nodeIdCounter = 0;

function buildTree(vals: (number | null)[]): TreeNode | null {
  if (!vals.length || vals[0] == null) return null;
  nodeIdCounter = 0;
  const root: TreeNode = { id: nodeIdCounter++, val: vals[0] };
  const queue: TreeNode[] = [root];
  let i = 1;
  while (i < vals.length && queue.length) {
    const node = queue.shift()!;
    if (i < vals.length && vals[i] != null) {
      node.left = { id: nodeIdCounter++, val: vals[i]! };
      queue.push(node.left);
    }
    i++;
    if (i < vals.length && vals[i] != null) {
      node.right = { id: nodeIdCounter++, val: vals[i]! };
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

function cloneTree(node: TreeNode | null | undefined): TreeNode | null {
  if (!node) return null;
  return { ...node, left: cloneTree(node.left) ?? undefined, right: cloneTree(node.right) ?? undefined };
}

function setHighlight(root: TreeNode | null | undefined, id: number, color: TreeNode['highlight']): void {
  if (!root) return;
  if (root.id === id) root.highlight = color;
  setHighlight(root.left, id, color);
  setHighlight(root.right, id, color);
}

// ─── BFS / Level Order Traversal ───────────────────────────────────────────────
const bfsTreeCode = `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);

      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}`;

function generateBFSTree(input: Record<string, unknown>): Frame[] {
  const vals = (input.tree as (number | null)[]) ?? [1, 2, 3, 4, 5, 6, 7];
  const root = buildTree(vals);
  const frames: Frame[] = [];

  const makeState = (root: TreeNode | null, highlights: TreeState['highlights'], queue: number[]): TreeState => ({
    root: cloneTree(root),
    highlights,
    queue,
  });

  frames.push({ line: 1, description: 'BFS Level Order Traversal', tree: makeState(root, [], []) });

  if (!root) { frames.push({ line: 2, description: 'Empty tree', tree: makeState(null, [], []) }); return frames; }

  const queue: TreeNode[] = [root];
  const result: number[][] = [];

  frames.push({ line: 3, description: `Initialize queue with root [${root.val}]`, tree: makeState(root, [{ id: root.id, color: 'current' }], [root.id]) });

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level: number[] = [];
    const levelIds = queue.map(n => n.id);

    frames.push({ line: 6, description: `Processing level with ${levelSize} node(s): [${levelIds.join(', ')}]`, tree: makeState(root, levelIds.map(id => ({ id, color: 'visiting' })), levelIds) });

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.val as number);

      frames.push({ line: 10, description: `Dequeue node ${node.val}`, tree: makeState(root, [{ id: node.id, color: 'current' }, ...queue.map(n => ({ id: n.id, color: 'visiting' as const }))], queue.map(n => n.id)) });

      setHighlight(root, node.id, 'visited');
      if (node.left) {
        queue.push(node.left);
        frames.push({ line: 12, description: `Enqueue left child ${node.left.val}`, tree: makeState(root, [...queue.map(n => ({ id: n.id, color: 'visiting' as const })), { id: node.id, color: 'visited' }], queue.map(n => n.id)) });
      }
      if (node.right) {
        queue.push(node.right);
        frames.push({ line: 13, description: `Enqueue right child ${node.right.val}`, tree: makeState(root, [...queue.map(n => ({ id: n.id, color: 'visiting' as const })), { id: node.id, color: 'visited' }], queue.map(n => n.id)) });
      }
    }
    result.push(level);
    frames.push({ line: 15, description: `Level complete: [${level.join(', ')}]`, tree: makeState(root, [], []) });
  }

  frames.push({ line: 17, description: `Result: [${result.map(l => `[${l}]`).join(', ')}]`, tree: makeState(root, [], []) });
  return frames;
}

// ─── DFS Inorder Traversal ─────────────────────────────────────────────────────
const dfsInorderCode = `function inorder(root) {
  const result = [];

  function dfs(node) {
    if (!node) return;

    dfs(node.left);          // visit left subtree
    result.push(node.val);   // visit current node
    dfs(node.right);         // visit right subtree
  }

  dfs(root);
  return result;
}`;

function generateDFSInorder(input: Record<string, unknown>): Frame[] {
  const vals = (input.tree as (number | null)[]) ?? [4, 2, 6, 1, 3, 5, 7];
  const root = buildTree(vals);
  const frames: Frame[] = [];
  const result: number[] = [];

  frames.push({ line: 1, description: 'DFS Inorder Traversal (Left → Root → Right)', tree: { root: cloneTree(root), highlights: [] } });

  function dfs(node: TreeNode | null | undefined, depth: number): void {
    if (!node) return;

    frames.push({ line: 6, description: `→ Go left from ${node.val} (depth ${depth})`, tree: { root: cloneTree(root), highlights: [{ id: node.id, color: 'current' }] } });
    dfs(node.left, depth + 1);

    result.push(node.val as number);
    setHighlight(root, node.id, 'visited');
    frames.push({ line: 7, description: `Visit node ${node.val} ← result: [${result.join(', ')}]`, tree: { root: cloneTree(root), highlights: [{ id: node.id, color: 'sorted' }] } });

    frames.push({ line: 8, description: `→ Go right from ${node.val}`, tree: { root: cloneTree(root), highlights: [{ id: node.id, color: 'current' }] } });
    dfs(node.right, depth + 1);
  }

  dfs(root, 0);
  frames.push({ line: 12, description: `Inorder result: [${result.join(', ')}]`, tree: { root: cloneTree(root), highlights: [] } });
  return frames;
}

// ─── BST Insert ────────────────────────────────────────────────────────────────
const bstInsertCode = `function bstInsert(root, val) {
  if (!root) {
    return new TreeNode(val);
  }

  if (val < root.val) {
    root.left = bstInsert(root.left, val);
  } else if (val > root.val) {
    root.right = bstInsert(root.right, val);
  }

  return root;
}`;

function generateBSTInsert(input: Record<string, unknown>): Frame[] {
  const vals = (input.tree as (number | null)[]) ?? [5, 3, 8, 1, 4, 7, 9];
  let root = buildTree(vals);
  const insertVal = (input.insertVal as number) ?? 6;
  const frames: Frame[] = [];

  frames.push({ line: 1, description: `BST Insert: add ${insertVal} to the tree`, tree: { root: cloneTree(root), highlights: [] } });

  function insert(node: TreeNode | null, val: number, depth: number): TreeNode {
    if (!node) {
      const newNode: TreeNode = { id: nodeIdCounter++, val };
      frames.push({ line: 3, description: `Found empty spot! Insert ${val} here`, tree: { root: cloneTree(root), highlights: [{ id: newNode.id, color: 'found' }] } });
      return newNode;
    }

    frames.push({ line: 6, description: `Compare ${val} with node ${node.val}`, tree: { root: cloneTree(root), highlights: [{ id: node.id, color: 'current' }] } });

    if (val < (node.val as number)) {
      frames.push({ line: 7, description: `${val} < ${node.val} → go LEFT`, tree: { root: cloneTree(root), highlights: [{ id: node.id, color: 'comparing' }] } });
      node.left = insert(node.left ?? null, val, depth + 1);
    } else if (val > (node.val as number)) {
      frames.push({ line: 9, description: `${val} > ${node.val} → go RIGHT`, tree: { root: cloneTree(root), highlights: [{ id: node.id, color: 'comparing' }] } });
      node.right = insert(node.right ?? null, val, depth + 1);
    }
    return node;
  }

  root = insert(root, insertVal, 0);
  frames.push({ line: 12, description: `Insert complete! ${insertVal} is now in the BST`, tree: { root: cloneTree(root), highlights: [] } });
  return frames;
}

export const treeAlgorithms: Algorithm[] = [
  {
    id: 'bfs-tree',
    name: 'Level Order BFS',
    category: 'trees',
    description: 'BFS visits nodes level by level using a queue.',
    code: bfsTreeCode,
    defaultInput: { tree: [1, 2, 3, 4, 5, 6, 7] },
    generate: generateBFSTree,
  },
  {
    id: 'dfs-inorder',
    name: 'DFS Inorder',
    category: 'trees',
    description: 'DFS visits Left → Root → Right, giving sorted order for BSTs.',
    code: dfsInorderCode,
    defaultInput: { tree: [4, 2, 6, 1, 3, 5, 7] },
    generate: generateDFSInorder,
  },
  {
    id: 'bst-insert',
    name: 'BST Insert',
    category: 'trees',
    description: 'Insert a value into a BST by comparing and navigating left/right.',
    code: bstInsertCode,
    defaultInput: { tree: [5, 3, 8, 1, 4, 7, 9], insertVal: 6 },
    generate: generateBSTInsert,
  },
];
