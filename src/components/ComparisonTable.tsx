import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'right';
  render: (row: T) => ReactNode;
}

interface ComparisonTableProps<T> {
  caption?: string;
  note?: string;
  columns: ColumnDef<T>[];
  rows: T[];
}

export function ComparisonTable<T>({ caption, note, columns, rows }: ComparisonTableProps<T>) {
  return (
    <div className="table-card">
      {caption && <h3 className="table-title">{caption}</h3>}
      <div className="table-scroll">
        <table className="cmp-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={c.align === 'right' ? 'th-right' : 'th-left'}
                  scope="col"
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={c.align === 'right' ? 'td-right' : 'td-left'}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="table-note">{note}</p>}
    </div>
  );
}