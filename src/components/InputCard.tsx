import type { ReactNode } from 'react';

interface InputCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function InputCard({ title, subtitle, icon, children }: InputCardProps) {
  return (
    <section className="card inputcard" aria-label={title}>
      <div className="card-head">
        {icon && <span className="card-head-icon">{icon}</span>}
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}