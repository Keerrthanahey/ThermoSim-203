import type { RankineResult } from '../lib/rankineCycle';
import { fmt, fmtDegC } from '../lib/formatters';

interface StateTableProps {
  result: RankineResult;
}

export function StateTable({ result }: StateTableProps) {
  return (
    <div className="table-card">
      <h3 className="table-title">Rankine cycle state points</h3>
      <div className="table-scroll">
        <table className="cmp-table state-table">
          <thead>
            <tr>
              <th className="th-left" scope="col">State</th>
              <th className="th-left" scope="col">Description</th>
              <th className="th-right" scope="col">P (kPa)</th>
              <th className="th-right" scope="col">T (°C)</th>
              <th className="th-right" scope="col">h (kJ/kg)</th>
              <th className="th-right" scope="col">s (kJ/kg·K)</th>
              <th className="th-right" scope="col">x</th>
            </tr>
          </thead>
          <tbody>
            {result.states.map((s) => (
              <tr key={s.state}>
                <td className="td-left td-strong">{s.state}</td>
                <td className="td-left">
                  {s.name}
                  <span className="state-phase">{s.phase}</span>
                </td>
                <td className="td-right">{fmt(s.P_kPa)}</td>
                <td className="td-right">{s.T_C === null ? '—' : fmtDegC(s.T_C)}</td>
                <td className="td-right">{fmt(s.h_kJkg, 2)}</td>
                <td className="td-right">{fmt(s.s_kJkgK, 4)}</td>
                <td className="td-right">{s.x === null ? '—' : fmt(s.x, 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">
        State 1 = saturated liquid at condenser pressure. State 2 = compressed liquid after the
        isentropic pump. State 3 = superheated steam at turbine inlet. State 4 = turbine exhaust at
        condenser pressure with quality x₄ from {fmt(result.x4, 4)}.
      </p>
    </div>
  );
}