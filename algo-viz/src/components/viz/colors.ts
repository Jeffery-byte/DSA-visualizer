import type { HighlightColor } from '../../types';

export const highlightColors: Record<HighlightColor, { bg: string; border: string; text: string; glow: string }> = {
  current:     { bg: '#1d4ed8', border: '#3b82f6', text: '#fff', glow: '0 0 12px #3b82f6' },
  visiting:    { bg: '#b45309', border: '#f59e0b', text: '#fff', glow: '0 0 12px #f59e0b' },
  visited:     { bg: '#166534', border: '#22c55e', text: '#fff', glow: '0 0 8px #22c55e' },
  comparing:   { bg: '#7c3aed', border: '#a855f7', text: '#fff', glow: '0 0 12px #a855f7' },
  found:       { bg: '#065f46', border: '#10b981', text: '#fff', glow: '0 0 16px #10b981' },
  path:        { bg: '#0e4a6e', border: '#06b6d4', text: '#fff', glow: '0 0 10px #06b6d4' },
  sorted:      { bg: '#14532d', border: '#4ade80', text: '#fff', glow: '0 0 8px #4ade80' },
  left:        { bg: '#14532d', border: '#22c55e', text: '#fff', glow: '0 0 10px #22c55e' },
  right:       { bg: '#7f1d1d', border: '#ef4444', text: '#fff', glow: '0 0 10px #ef4444' },
  mid:         { bg: '#713f12', border: '#eab308', text: '#fff', glow: '0 0 10px #eab308' },
  pivot:       { bg: '#7c2d12', border: '#f97316', text: '#fff', glow: '0 0 10px #f97316' },
  'dp-current':{ bg: '#1e1b4b', border: '#818cf8', text: '#fff', glow: '0 0 12px #818cf8' },
  'dp-source': { bg: '#312e81', border: '#6366f1', text: '#fff', glow: '0 0 8px #6366f1' },
  head:        { bg: '#1d4ed8', border: '#60a5fa', text: '#fff', glow: '0 0 10px #60a5fa' },
  tail:        { bg: '#be185d', border: '#f472b6', text: '#fff', glow: '0 0 10px #f472b6' },
  swapping:    { bg: '#c2410c', border: '#fb923c', text: '#fff', glow: '0 0 12px #fb923c' },
  source:      { bg: '#1e3a5f', border: '#38bdf8', text: '#fff', glow: '0 0 12px #38bdf8' },
  target:      { bg: '#7f1d1d', border: '#f87171', text: '#fff', glow: '0 0 12px #f87171' },
  'in-stack':  { bg: '#3b0764', border: '#c084fc', text: '#fff', glow: '0 0 10px #c084fc' },
  result:      { bg: '#065f46', border: '#34d399', text: '#fff', glow: '0 0 16px #34d399' },
  excluded:    { bg: '#1f2937', border: '#374151', text: '#6b7280', glow: 'none' },
};

export function getHighlightStyle(color: HighlightColor) {
  return highlightColors[color] ?? highlightColors.current;
}
