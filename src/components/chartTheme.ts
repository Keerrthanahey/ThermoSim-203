/** Shared chart theme so every graph uses the same engineering palette. */

export const chartPalette = {
  blue: '#5b9dff',
  cyan: '#22d3ee',
  teal: '#2dd4bf',
  amber: '#f5b942',
  violet: '#a78bfa',
  rose: '#f472b6',
  gray: '#94a3b8',
} as const;

export const tooltipStyle = {
  backgroundColor: '#0d1630',
  border: '1px solid rgba(120, 150, 200, 0.3)',
  borderRadius: 10,
  fontSize: 12,
  color: '#e6edf7',
  boxShadow: '0 8px 24px rgba(2, 8, 20, 0.6)',
} as const;

export const axisTick = { fill: '#7c8db0', fontSize: 12 } as const;

export const axisLine = { stroke: 'rgba(120,150,200,0.3)' } as const;

export function tickKw(v: number): string {
  return Number.isFinite(v) ? v.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '';
}

export function tickPct(v: number): string {
  return Number.isFinite(v) ? `${(v * 100).toLocaleString('en-US', { maximumFractionDigits: 1 })}%` : '';
}