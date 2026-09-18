import { chartPalette } from './chartTheme';
import type { RankineResult } from '../lib/rankineCycle';

interface RankineTSChartProps {
  result: RankineResult | null;
}

const W = 620;
const H = 400;
const L = 60;
const T = 30;
const R = 30;
const B = 60;
const PW = W - L - R;
const PH = H - T - B;

const S_MAX = 8.7;
const T_MAX = 520;

function cx(s: number): number {
  return L + (s / S_MAX) * PW;
}
function cy(t: number): number {
  return T + PH - (t / T_MAX) * PH;
}

export default function RankineTSChart({ result }: RankineTSChartProps) {
  const tsatCond = result?.valid ? result.tsatC : 45.83;
  const s1 = result?.valid ? result.states[0]?.s_kJkgK : 0.649;
  const s3 = result?.valid ? result.states[2]?.s_kJkgK : 6.8;
  const turbineT = result?.valid ? result.states[2]?.T_C ?? 500 : 500;
  const S1 = s1 as number;
  const S3 = s3 as number;

  // Dotted reference line for Tsat at condenser pressure.
  const satLineY = cy(tsatCond);

  return (
    <div className="diagram">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Schematic temperature–entropy diagram of the ideal Rankine cycle: 1 to 2 isentropic pumping, 2 to 3 constant-pressure heating, 3 to 4 isentropic expansion, 4 to 1 constant-pressure condensation"
        className="diagram-svg"
      >
        <defs>
          <marker id="ts-arrow-blue" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,6 L8,3 z" fill={chartPalette.blue} />
          </marker>
          <marker id="ts-arrow-cyan" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,6 L8,3 z" fill={chartPalette.cyan} />
          </marker>
          <marker id="ts-arrow-violet" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,6 L8,3 z" fill={chartPalette.violet} />
          </marker>
          <marker id="ts-arrow-amber" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,6 L8,3 z" fill={chartPalette.amber} />
          </marker>
        </defs>

        {/* grid */}
        {[0, 174, 374].map((tc) => (
          <line key={`tg${tc}`} x1={L} y1={cy(tc)} x2={L + PW} y2={cy(tc)} className="grid-h" />
        ))}
        {[0, 2, 4, 6, 8].map((sv) => (
          <line key={`sg${sv}`} x1={cx(sv)} y1={T} x2={cx(sv)} y2={T + PH} className="grid-v" />
        ))}

        {/* axes */}
        <line x1={L} y1={T + PH} x2={L + PW} y2={T + PH} className="axis" />
        <line x1={L} y1={T + PH} x2={L} y2={T} className="axis" />
        <path d={`M${L + PW},${T + PH} l8,-4 l0,8 z`} fill="#8fa7c7" />
        <path d={`M${L},${T + PH} l8,-4 l0,8 z`} fill="#8fa7c7" />

        {/* saturation dome */}
        <path
          d={`M${cx(0.02)},${cy(100)} C ${cx(0.7)},${cy(240)} ${cx(3.0)},${cy(355)} ${cx(4.42)},${cy(374)}`}
          fill="none"
          stroke={chartPalette.gray}
          strokeWidth={1.5}
          strokeDasharray="5 3"
          className="dome-line"
        />
        <path
          d={`M${cx(4.42)},${cy(374)} C ${cx(5.6)},${cy(320)} ${cx(7.6)},${cy(150)} ${cx(8.53)},${cy(45.83)}`}
          fill="none"
          stroke={chartPalette.gray}
          strokeWidth={1.5}
          strokeDasharray="5 3"
          className="dome-line"
        />
        <circle cx={cx(4.42)} cy={cy(374)} r={3} fill={chartPalette.gray} />
        <text x={cx(4.42) + 6} y={cy(374) - 6} fontSize={10} fill={chartPalette.gray}>
          cp
        </text>

        {/* condenser saturation reference line */}
        <line x1={cx(0.3)} y1={satLineY} x2={cx(8.6)} y2={satLineY} stroke="rgba(148,163,184,0.25)" strokeDasharray="3 3" />
        <text x={cx(8.6)} y={satLineY - 5} textAnchor="end" fontSize={10} fill="#64748b">
          T sat ≈ {tsatCond.toFixed(1)} °C
        </text>

        {/* process 1 → 2 pump (exaggerated for visibility, isentropic) */}
        <path
          d={`M${cx(S1)},${cy(tsatCond)} L ${cx(S1 + 0.16)},${cy(tsatCond + 3)}`}
          fill="none"
          stroke={chartPalette.blue}
          strokeWidth={2.2}
          markerEnd="url(#ts-arrow-blue)"
        />

        {/* process 2 → 3 boiler: liquid heating → boiling → superheating (schematic) */}
        <path
          d={`M${cx(S1 + 0.16)},${cy(tsatCond + 3)} C ${cx(2.1)},${cy(210)} ${cx(4.3)},${cy(288)} ${cx(5.9)},${cy(288)}`}
          fill="none"
          stroke={chartPalette.cyan}
          strokeWidth={2.2}
        />
        <path
          d={`M${cx(5.9)},${cy(288)} L ${cx(6.2)},${cy(288)}`}
          fill="none"
          stroke={chartPalette.cyan}
          strokeWidth={2.2}
          strokeDasharray="4 3"
        />
        <path
          d={`M${cx(6.2)},${cy(288)} C ${cx(6.25)},${cy(360)} ${cx(6.7)},${cy(460)} ${cx(S3)},${cy(turbineT)}`}
          fill="none"
          stroke={chartPalette.cyan}
          strokeWidth={2.2}
          markerEnd="url(#ts-arrow-cyan)"
        />
        <text x={cx(6.05)} y={cy(288) - 7} textAnchor="middle" fontSize={10} fill={chartPalette.cyan}>
          boiling
        </text>

        {/* process 3 → 4 turbine (isentropic) */}
        <path
          d={`M${cx(S3)},${cy(turbineT)} L ${cx(S3)},${cy(tsatCond)}`}
          fill="none"
          stroke={chartPalette.violet}
          strokeWidth={2.2}
          markerEnd="url(#ts-arrow-violet)"
        />

        {/* process 4 → 1 condenser (constant pressure) */}
        <path
          d={`M${cx(S3)},${cy(tsatCond)} L ${cx(S1)},${cy(tsatCond)}`}
          fill="none"
          stroke={chartPalette.amber}
          strokeWidth={2.2}
          strokeDasharray="2 1"
          markerEnd="url(#ts-arrow-amber)"
        />

        {/* state labels */}
        <circle cx={cx(S1)} cy={cy(tsatCond)} r={4.5} fill={chartPalette.blue} />
        <text x={cx(S1) + 8} y={cy(tsatCond) + 6} className="state-label">1</text>
        <circle cx={cx(S1 + 0.16)} cy={cy(tsatCond + 3)} r={4.5} fill={chartPalette.blue} />
        <text x={cx(S1 + 0.16) + 8} y={cy(tsatCond + 3) - 6} className="state-label">2</text>
        <circle cx={cx(S3)} cy={cy(turbineT)} r={4.5} fill={chartPalette.violet} />
        <text x={cx(S3) - 8} y={cy(turbineT) - 8} textAnchor="end" className="state-label">3</text>
        <circle cx={cx(S3)} cy={cy(tsatCond)} r={4.5} fill={chartPalette.amber} />
        <text x={cx(S3) + 8} y={cy(tsatCond) + 6} className="state-label">4</text>

        {/* axis names */}
        <text x={L + PW / 2} y={H - 14} textAnchor="middle" className="axis-label">
          Entropy, s (kJ/kg·K)
        </text>
        <text
          x={16}
          y={T + PH / 2}
          textAnchor="middle"
          className="axis-label"
          transform={`rotate(-90 16 ${T + PH / 2})`}
        >
          Temperature, T (°C)
        </text>
      </svg>

      <ul className="diagram-legend">
        <li><span className="legend-swatch" style={{ background: chartPalette.blue }} />1 → 2 Pump (isentropic)</li>
        <li><span className="legend-swatch" style={{ background: chartPalette.cyan }} />2 → 3 Boiler (constant pressure)</li>
        <li><span className="legend-swatch" style={{ background: chartPalette.violet }} />3 → 4 Turbine (isentropic)</li>
        <li><span className="legend-swatch" style={{ background: chartPalette.amber }} />4 → 1 Condenser (constant pressure)</li>
      </ul>
      <p className="diagram-note">Schematic T–s diagram — the saturation dome and process paths are illustrative rather than to scale.</p>
    </div>
  );
}