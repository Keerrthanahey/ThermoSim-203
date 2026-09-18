import type { ReactNode } from 'react';

export type Accent = 'blue' | 'cyan' | 'teal' | 'amber' | 'violet' | 'slate';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: Accent;
}

export function StatCard({ label, value, hint, accent = 'slate' }: StatCardProps) {
  return (
    <div className={`statcard accent-${accent}`}>
      <span className="statcard-label">{label}</span>
      <span className="statcard-value">{value}</span>
      {hint && <span className="statcard-hint">{hint}</span>}
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  accent?: Accent;
  large?: boolean;
}

export function ResultCard({ label, value, unit, sub, accent = 'blue', large }: ResultCardProps) {
  return (
    <div className={`resultcard accent-${accent}${large ? ' resultcard-large' : ''}`}>
      <span className="resultcard-label">{label}</span>
      <div className="resultcard-main">
        <span className="resultcard-value">{value}</span>
        {unit && <span className="resultcard-unit">{unit}</span>}
      </div>
      {sub && <span className="resultcard-sub">{sub}</span>}
    </div>
  );
}

interface InfoChipProps {
  label: string;
  value: ReactNode;
}

export function InfoChip({ label, value }: InfoChipProps) {
  return (
    <div className="infochip">
      <span className="infochip-label">{label}</span>
      <span className="infochip-value">{value}</span>
    </div>
  );
}