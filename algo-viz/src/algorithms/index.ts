import type { AlgorithmGroup } from '../types';
import { arrayAlgorithms }        from './arrays';
import { binarySearchAlgorithms } from './searching';
import { twoPointerAlgorithms }   from './two-pointers';
import { slidingWindowAlgorithms } from './sliding-window';
import { hashmapAlgorithms }      from './hashmaps';
import { graphAlgorithms }        from './graphs';
import { treeAlgorithms }         from './trees';
import { recursionAlgorithms }    from './recursion';
import { dpAlgorithms }           from './dp';
import { heapAlgorithms }         from './heaps';

export const algorithmGroups: AlgorithmGroup[] = [
  {
    id:         'arrays',
    label:      'Arrays',
    icon:       '▤',
    algorithms: arrayAlgorithms,
  },
  {
    id:         'searching',
    label:      'Binary Search',
    icon:       '⌕',
    algorithms: binarySearchAlgorithms,
  },
  {
    id:         'two-pointers',
    label:      'Two Pointers',
    icon:       '↔',
    algorithms: twoPointerAlgorithms,
  },
  {
    id:         'sliding-window',
    label:      'Sliding Window',
    icon:       '⊡',
    algorithms: slidingWindowAlgorithms,
  },
  {
    id:         'hashmaps',
    label:      'Hash Maps',
    icon:       '#',
    algorithms: hashmapAlgorithms,
  },
  {
    id:         'graphs',
    label:      'Graphs & Grids',
    icon:       '⬡',
    algorithms: graphAlgorithms,
  },
  {
    id:         'trees',
    label:      'Trees',
    icon:       '🌲',
    algorithms: treeAlgorithms,
  },
  {
    id:         'recursion',
    label:      'Recursion',
    icon:       '↺',
    algorithms: recursionAlgorithms.filter(a => a.category === 'recursion'),
  },
  {
    id:         'backtracking',
    label:      'Backtracking',
    icon:       '↩',
    algorithms: recursionAlgorithms.filter(a => a.category === 'backtracking'),
  },
  {
    id:         'heap',
    label:      'Heaps',
    icon:       '△',
    algorithms: heapAlgorithms,
  },
  {
    id:         'dp-1d',
    label:      '1D Dynamic Programming',
    icon:       '─',
    algorithms: dpAlgorithms.filter(a => a.category === 'dp-1d'),
  },
  {
    id:         'dp-2d',
    label:      '2D Dynamic Programming',
    icon:       '⊞',
    algorithms: dpAlgorithms.filter(a => a.category === 'dp-2d'),
  },
];

export const allAlgorithms = algorithmGroups.flatMap(g => g.algorithms);
