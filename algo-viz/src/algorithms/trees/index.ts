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

// ─── BFS Level Order ──────────────────────────────────────────────────────────
function generateBFSTree(input: Record<string, unknown>): Frame[] {
  const vals = (input.tree as (number | null)[]) ?? [1, 2, 3, 4, 5, 6, 7];
  const root = buildTree(vals);
  const frames: Frame[] = [];

  const makeState = (root: TreeNode | null, highlights: TreeState['highlights'], queue: number[]): TreeState => ({
    root: cloneTree(root), highlights, queue,
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

    frames.push({ line: 6, description: `Processing level with ${levelSize} node(s)`, tree: makeState(root, levelIds.map(id => ({ id, color: 'visiting' })), levelIds) });

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

// ─── DFS Inorder ──────────────────────────────────────────────────────────────
function generateDFSInorder(input: Record<string, unknown>): Frame[] {
  const vals = (input.tree as (number | null)[]) ?? [4, 2, 6, 1, 3, 5, 7];
  const root = buildTree(vals);
  const frames: Frame[] = [];
  const result: number[] = [];

  frames.push({ line: 1, description: 'DFS Inorder Traversal (Left → Root → Right)', tree: { root: cloneTree(root), highlights: [] } });

  function dfs(node: TreeNode | null | undefined, depth: number): void {
    if (!node) return;
    frames.push({ line: 5, description: `→ Recurse left from ${node.val}`, tree: { root: cloneTree(root), highlights: [{ id: node.id, color: 'current' }] } });
    dfs(node.left, depth + 1);

    result.push(node.val as number);
    setHighlight(root, node.id, 'visited');
    frames.push({ line: 6, description: `Visit ${node.val}  ← result: [${result.join(', ')}]`, tree: { root: cloneTree(root), highlights: [{ id: node.id, color: 'sorted' }] } });

    frames.push({ line: 7, description: `→ Recurse right from ${node.val}`, tree: { root: cloneTree(root), highlights: [{ id: node.id, color: 'current' }] } });
    dfs(node.right, depth + 1);
  }

  dfs(root, 0);
  frames.push({ line: 11, description: `Inorder result: [${result.join(', ')}]`, tree: { root: cloneTree(root), highlights: [] } });
  return frames;
}

// ─── BST Insert ───────────────────────────────────────────────────────────────
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
    description: 'Process nodes level by level using a queue: dequeue, record, enqueue children.',
    complexity: {
      time: 'O(n)',
      space: 'O(n)',
      reasoning:
        'Every node is enqueued and dequeued exactly once — O(n) time. The queue holds at most one full level of the tree at a time. In a complete binary tree the widest level is the last one, containing up to n/2 nodes, giving O(n) space in the worst case. The result array also accumulates all n values.',
    },
    codes: {
      javascript: `function levelOrder(root) {
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
}`,
      typescript: `function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.val);

      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}`,
      python: `from collections import deque

def level_order(root):
    if not root:
        return []
    result, queue = [], deque([root])

    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:  queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)

    return result`,
      java: `public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;

    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        List<Integer> level = new ArrayList<>();

        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left  != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
    }
    return result;
}`,
      c: `/* Level-order using array-based queue */
void levelOrder(struct TreeNode* root) {
    if (!root) return;
    struct TreeNode* q[1000];
    int head=0, tail=0;
    q[tail++] = root;

    while (head < tail) {
        int sz = tail - head;
        for (int i = 0; i < sz; i++) {
            struct TreeNode* node = q[head++];
            printf("%d ", node->val);
            if (node->left)  q[tail++] = node->left;
            if (node->right) q[tail++] = node->right;
        }
        printf("\\n"); /* end of level */
    }
}`,
    },
    lineMap: {
      typescript: { 1: 1, 3: 3, 6: 6, 10: 10, 12: 12, 13: 13, 15: 16, 17: 18 },
      python:     { 1: 3, 3: 5, 6: 7, 10: 9, 12: 11, 13: 12, 15: 13, 17: 15 },
      java:       { 1: 1, 3: 2, 6: 8, 10: 12, 12: 14, 13: 15, 15: 17, 17: 19 },
      c:          { 1: 2, 3: 5, 6: 8, 10: 11, 12: 13, 13: 14, 15: 15, 17: 17 },
    },
    defaultInput: { tree: [1, 2, 3, 4, 5, 6, 7] },
    generate: generateBFSTree,
  },
  {
    id: 'dfs-inorder',
    name: 'DFS Inorder',
    category: 'trees',
    description: 'Recurse left, visit current node, recurse right. Produces sorted output for BSTs.',
    complexity: {
      time: 'O(n)',
      space: 'O(h)',
      reasoning:
        'Every node is visited exactly once — O(n). The recursion call stack depth equals the tree height h. For a balanced tree h = O(log n); for a degenerate (linked-list) tree h = O(n). Average case with random insertion is O(log n) stack depth. The result array costs O(n) space, but that\'s output space — the additional space beyond the input is O(h).',
    },
    codes: {
      javascript: `function inorder(root) {
  const result = [];

  function dfs(node) {
    if (!node) return;

    dfs(node.left);          // visit left subtree
    result.push(node.val);   // visit current node
    dfs(node.right);         // visit right subtree
  }

  dfs(root);
  return result;
}`,
      typescript: `function inorder(root: TreeNode | null): number[] {
  const result: number[] = [];

  function dfs(node: TreeNode | null): void {
    if (!node) return;

    dfs(node.left ?? null);  // visit left subtree
    result.push(node.val);   // visit current node
    dfs(node.right ?? null); // visit right subtree
  }

  dfs(root);
  return result;
}`,
      python: `def inorder(root):
    result = []

    def dfs(node):
        if not node:
            return
        dfs(node.left)           # visit left subtree
        result.append(node.val)  # visit current node
        dfs(node.right)          # visit right subtree

    dfs(root)
    return result`,
      java: `public List<Integer> inorder(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    dfs(root, result);
    return result;
}

private void dfs(TreeNode node, List<Integer> result) {
    if (node == null) return;

    dfs(node.left,  result); // visit left subtree
    result.add(node.val);    // visit current node
    dfs(node.right, result); // visit right subtree
}`,
      c: `void dfs(struct TreeNode* node, int* result, int* idx) {
    if (!node) return;
    dfs(node->left,  result, idx); /* left subtree  */
    result[(*idx)++] = node->val;  /* current node  */
    dfs(node->right, result, idx); /* right subtree */
}

int* inorder(struct TreeNode* root, int* size) {
    int* result = malloc(100 * sizeof(int));
    *size = 0;
    dfs(root, result, size);
    return result;
}`,
    },
    lineMap: {
      typescript: { 1: 1, 5: 5, 6: 7, 7: 9, 11: 12 },
      python:     { 1: 1, 5: 4, 6: 7, 7: 8, 11: 10 },
      java:       { 1: 1, 5: 7, 6: 9, 7: 10, 11: 4 },
      c:          { 1: 8, 5: 1, 6: 3, 7: 4, 11: 10 },
    },
    defaultInput: { tree: [4, 2, 6, 1, 3, 5, 7] },
    generate: generateDFSInorder,
  },
  {
    id: 'bst-insert',
    name: 'BST Insert',
    category: 'trees',
    description: 'Navigate left if value is smaller, right if larger; insert when an empty spot is reached.',
    complexity: {
      time: 'O(h)',
      space: 'O(h)',
      reasoning:
        'We follow exactly one root-to-leaf path, comparing at each level. The path length equals the tree height h. For a balanced BST h = O(log n) — this is the optimal case. For a skewed tree (inserting already-sorted data) h = O(n), degrading to O(n) time. The recursion stack matches the path depth: O(h) space. An iterative version reduces space to O(1).',
    },
    codes: {
      javascript: `function bstInsert(root, val) {
  if (!root) {
    return new TreeNode(val);
  }

  if (val < root.val) {
    root.left = bstInsert(root.left, val);
  } else if (val > root.val) {
    root.right = bstInsert(root.right, val);
  }

  return root;
}`,
      typescript: `function bstInsert(root: TreeNode | null, val: number): TreeNode {
  if (!root) {
    return new TreeNode(val);
  }

  if (val < root.val) {
    root.left = bstInsert(root.left ?? null, val);
  } else if (val > root.val) {
    root.right = bstInsert(root.right ?? null, val);
  }

  return root;
}`,
      python: `def bst_insert(root, val):
    if not root:
        return TreeNode(val)

    if val < root.val:
        root.left = bst_insert(root.left, val)
    elif val > root.val:
        root.right = bst_insert(root.right, val)

    return root`,
      java: `public TreeNode bstInsert(TreeNode root, int val) {
    if (root == null) {
        return new TreeNode(val);
    }

    if (val < root.val) {
        root.left = bstInsert(root.left, val);
    } else if (val > root.val) {
        root.right = bstInsert(root.right, val);
    }

    return root;
}`,
      c: `struct TreeNode* bstInsert(struct TreeNode* root, int val) {
    if (!root) {
        struct TreeNode* node = malloc(sizeof(struct TreeNode));
        node->val = val; node->left = node->right = NULL;
        return node;
    }
    if (val < root->val)
        root->left  = bstInsert(root->left,  val);
    else if (val > root->val)
        root->right = bstInsert(root->right, val);
    return root;
}`,
    },
    lineMap: {
      typescript: { 1: 1, 3: 3, 6: 6, 7: 7, 9: 9, 12: 12 },
      python:     { 1: 1, 3: 2, 6: 5, 7: 6, 9: 8, 12: 10 },
      java:       { 1: 1, 3: 3, 6: 6, 7: 7, 9: 9, 12: 12 },
      c:          { 1: 1, 3: 2, 6: 6, 7: 7, 9: 8, 12: 10 },
    },
    defaultInput: { tree: [5, 3, 8, 1, 4, 7, 9], insertVal: 6 },
    generate: generateBSTInsert,
  },
];
