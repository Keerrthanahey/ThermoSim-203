import type { ReactNode } from 'react';

interface ChartFrameProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
}

export function ChartFrame({ title, subtitle, children, height = 300 }: ChartFrameProps) {
  return (
    <section className="card chart-card">
      <div className="card-head">
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="chart-box" style={{ height }}>
        {children}
      </div>
    </section>
  );
}