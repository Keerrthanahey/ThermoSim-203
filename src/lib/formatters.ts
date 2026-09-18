/** Engineering-friendly number formatting helpers. */

export function fmt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtPercent(ratio: number, digits = 2): string {
  if (!Number.isFinite(ratio)) return '—';
  return `${fmt(ratio * 100, digits)} %`;
}

export function fmtkW(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${fmt(value)} kW`;
}

export function fmtMW(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return '—';
  return `${fmt(value, digits)} MW`;
}

export function fmtDegC(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${fmt(value)} °C`;
}

export function fmtK(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${fmt(value)} K`;
}

export function fmtKgS(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${fmt(value)} kg/s`;
}

export function fmtKJkg(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${fmt(value)} kJ/kg`;
}

export function fmtKPa(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${fmt(value)} kPa`;
}

export function fmtMPa(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${fmt(value, 3)} MPa`;
}

export function fmtM3(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${fmt(value, 4)} m³`;
}

export function fmtKg(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${fmt(value)} kg`;
}

/** Picks a word based on the sign of a change. */
export function trend(direction: number, pos: string, neg: string, flat = 'remains essentially unchanged'): string {
  if (direction > 1e-9) return pos;
  if (direction < -1e-9) return neg;
  return flat;
}

/** Returns the sign-adjusted absolute change: "up by 3.2", "down by 1.4". */
export function magnitude(direction: number, digits = 2): string {
  const abs = Math.abs(direction);
  const verb = direction >= 0 ? 'up' : 'down';
  return `${verb} by ${fmt(abs, digits)}`;
}