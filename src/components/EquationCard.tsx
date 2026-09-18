import type { ReactNode } from 'react';

interface EquationDef {
  name?: string;
  /** Plain-text or light-HTML equation using <sub>/<sup> markup. */
  math: string;
}

interface EquationCardProps {
  title: string;
  icon?: ReactNode;
  equations: EquationDef[];
  note?: string;
}

export function EquationCard({ title, icon, equations, note }: EquationCardProps) {
  return (
    <section className="card equation-card">
      <div className="card-head">
        {icon && <span className="card-head-icon">{icon}</span>}
        <h3 className="card-title">{title}</h3>
      </div>
      <dl className="equation-list">
        {equations.map((eq, i) => (
          <div className="equation-row" key={i}>
            {eq.name && <dt className="equation-name">{eq.name}</dt>}
            <dd className="equation-math" dangerouslySetInnerHTML={{ __html: eq.math }} />
          </div>
        ))}
      </dl>
      {note && <p className="card-note">{note}</p>}
    </section>
  );
}