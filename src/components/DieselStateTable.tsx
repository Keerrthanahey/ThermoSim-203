import type { DieselResult } from '../lib/dieselCycle';
import { fmt } from '../lib/formatters';

interface DieselStateTableProps {
  result: DieselResult;
}

export function DieselStateTable({ result }: DieselStateTableProps) {
  if (!result.valid) return null;

  const rows = [
    {
      state: '1',
      process: 'Start of isentropic compression',
      T_C: result.t1C,
      p: result.p1KPa,
      v: result.maxVolumeM3,
      vHint: `ν₁ = ${fmt(result.specificVolume1M3kg, 4)} m³/kg`,
    },
    {
      state: '2',
      process: 'End of compression (top dead centre)',
      T_C: result.t2C,
      p: result.p2KPa,
      v: result.clearanceVolumeM3,
    },
    {
      state: '3',
      process: 'End of constant-pressure heat addition',
      T_C: result.t3C,
      p: result.p3KPa,
      v: result.cutoffVolumeM3,
    },
    {
      state: '4',
      process: 'End of isentropic expansion',
      T_C: result.t4C,
      p: result.p4KPa,
      v: result.maxVolumeM3,
    },
  ];

  return (
    <div className="table-card">
      <h3 className="table-title">Diesel cycle state points</h3>
      <div className="table-scroll">
        <table className="cmp-table state-table">
          <thead>
            <tr>
              <th className="th-left" scope="col">State</th>
              <th className="th-left" scope="col">Process</th>
              <th className="th-right" scope="col">T (°C)</th>
              <th className="th-right" scope="col">P (kPa)</th>
              <th className="th-right" scope="col">V (m³)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.state}>
                <td className="td-left td-strong">{r.state}</td>
                <td className="td-left">
                  {r.process}
                  {r.vHint && <span className="state-phase">{r.vHint}</span>}
                </td>
                <td className="td-right">{fmt(r.T_C, 1)}</td>
                <td className="td-right">{fmt(r.p, 1)}</td>
                <td className="td-right">{fmt(r.v, 6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">
        Per-cylinder volumes for the 2.4 L four-cylinder engine: V₁ = r·V₂ ={' '}
        {fmt(result.maxVolumeM3, 5)} m³, V₂ = Vd/(r − 1) = {fmt(result.clearanceVolumeM3, 6)} m³,
        V₃ = r_c·V₂ = {fmt(result.cutoffVolumeM3, 6)} m³, V₄ = V₁. Pressure in kPa × volume in m³
        gives kJ directly.
      </p>
    </div>
  );
}