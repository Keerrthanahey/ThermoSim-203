import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface AssumptionsCardProps {
  title: string;
  icon?: ReactNode;
  items: readonly string[];
  accent?: 'blue' | 'teal';
}

export function AssumptionsCard({ title, icon, items, accent = 'blue' }: AssumptionsCardProps) {
  return (
    <section className={`card assumptions-card accent-${accent}`} aria-label={title}>
      <div className="card-head">
        {icon && <span className="card-head-icon">{icon}</span>}
        <h3 className="card-title">{title}</h3>
      </div>
      <ul className="assumptions-list">
        {items.map((item, i) => (
          <li className="assumption-item" key={i}>
            <span className="assumption-check" aria-hidden="true">
              <Check size={14} strokeWidth={2.5} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}