import { useMemo } from 'react';
import type { DieselResult } from '../lib/dieselCycle';
import { AIR } from '../lib/dieselCycle';
import { chartPalette } from './chartTheme';

interface DieselPVChartProps {
  result: DieselResult | null;
}

const W = 620;
const H = 400;
const L = 68;
const T = 30;
const R = 30;
const B = 60;
const PW = W - L - R;
const PH = H - T - B;

function sci(v: number): string {
  if (v >= 1e-3) return v.toFixed(3);
  if (v >= 1e-4) return v.toFixed(4);
  return v.toExponential(1);
}

export default function DieselPVChart({ result }: DieselPVChartProps) {
  const geom = useMemo(() => {
    if (!result || !result.valid) return null;
    const vMax = result.maxVolumeM3 * 1.12;
    const pMax = result.p2KPa * 1.12;
    const px = (v: number) => L + (v / vMax) * PW;
    const py = (p: number) => T + PH - (p / pMax) * PH;
    const k = AIR.k;

    const sample = (vFrom: number, vTo: number, pFrom: number, baseV: number) => {
      const pts: string[] = [];
      const n = 60;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const v = vFrom + (vTo - vFrom) * t;
        const p = pFrom * Math.pow(baseV / Math.max(v, 1e-12), k);
        pts.push(`${i === 0 ? 'M' : 'L'}${px(v).toFixed(2)},${py(p).toFixed(2)}`);
      }
      return pts.join(' ');
    };

    const compression = sample(result.maxVolumeM3, result.clearanceVolumeM3, result.p1KPa, result.maxVolumeM3);
    const expansion = sample(result.cutoffVolumeM3, result.maxVolumeM3, result.p3KPa, result.cutoffVolumeM3);

    const p1 = { x: px(result.maxVolumeM3), y: py(result.p1KPa) };
    const p2 = { x: px(result.clearanceVolumeM3), y: py(result.p2KPa) };
    const p3 = { x: px(result.cutoffVolumeM3), y: py(result.p3KPa) };
    const p4 = { x: px(result.maxVolumeM3), y: py(result.p4KPa) };
    const heatAdd = `M${p2.x},${p2.y} L${p3.x},${p3.y}`;
    const reject = `M${p4.x},${p4.y} L${p1.x},${p1.y}`;

    const vTicks = [0, result.maxVolumeM3 / 2, result.maxVolumeM3];
    const pTicks = [0, Math.round(result.p4KPa), Math.round(result.p1KPa), Math.round(result.p2KPa)];

    return {
      compression,
      expansion,
      heatAdd,
      reject,
      p1,
      p2,
      p3,
      p4,
      vTicks,
      pTicks,
      px,
      py,
    };
  }, [result]);

  if (!geom) {
    return (
      <div className="diagram-empty" role="img" aria-label="P-V diagram requires valid inputs">
        Enter valid cycle inputs to render the P–V diagram.
      </div>
    );
  }

  const { compression, expansion, heatAdd, reject, p1, p2, p3, p4, vTicks, pTicks, px, py } = geom;
  const ramp = R;

  return (
    <div className="diagram">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Ideal Diesel cycle pressure–volume diagram: isentropic compression 1 to 2, constant-pressure heat addition 2 to 3, isentropic expansion 3 to 4, constant-volume heat rejection 4 to 1"
        className="diagram-svg"
      >
        <defs>
          <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,6 L8,3 z" fill={chartPalette.blue} />
          </marker>
          <marker id="arrow-cyan" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,6 L8,3 z" fill={chartPalette.cyan} />
          </marker>
          <marker id="arrow-violet" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,6 L8,3 z" fill={chartPalette.violet} />
          </marker>
          <marker id="arrow-amber" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,6 L8,3 z" fill={chartPalette.amber} />
          </marker>
        </defs>

        {/* grid */}
        {vTicks.map((v) => (
          <line key={`vg${v}`} x1={px(v)} y1={T} x2={px(v)} y2={T + PH} className="grid-v" />
        ))}
        {pTicks.map((p) => (
          <line key={`pg${p}`} x1={L} y1={py(p)} x2={L + PW} y2={py(p)} className="grid-h" />
        ))}

        {/* axes */}
        <line x1={L} y1={T + PH} x2={L + PW} y2={T + PH} className="axis" />
        <line x1={L} y1={T + PH} x2={L} y2={T} className="axis" />
        <path d={`M${L + PW},${T + PH} l8,-4 l0,8 z`} fill="#8fa7c7" />
        <path d={`M${L},${T + PH} l8,-4 l0,8 z`} fill="#8fa7c7" />
        <line x1={L + PW} y1={T + PH} x2={L + PW + ramp} y2={T + PH} stroke="#8fa7c7" />

        {/* axis ticks */}
        {vTicks.map((v) => (
          <g key={`vt${v}`}>
            <line x1={px(v)} y1={T + PH} x2={px(v)} y2={T + PH + 5} className="axis" />
            <text x={px(v)} y={T + PH + 20} textAnchor="middle" className="tick-label">
              {v === 0 ? '0' : sci(v)}
            </text>
          </g>
        ))}
        {pTicks.map((p) => (
          <g key={`pt${p}`}>
            <line x1={L - 5} y1={py(p)} x2={L} y2={py(p)} className="axis" />
            <text x={L - 8} y={py(p) + 4} textAnchor="end" className="tick-label">
              {p === 0 ? '0' : p}
            </text>
          </g>
        ))}

        {/* title see diagram-legend text */}

        {/* processes */}
        <path d={compression} fill="none" stroke={chartPalette.blue} strokeWidth={2} markerEnd="url(#arrow-blue)" />
        <path d={heatAdd} fill="none" stroke={chartPalette.cyan} strokeWidth={2} markerEnd="url(#arrow-cyan)" />
        <path d={expansion} fill="none" stroke={chartPalette.violet} strokeWidth={2} markerEnd="url(#arrow-violet)" />
        <path d={reject} fill="none" stroke={chartPalette.amber} strokeWidth={2} strokeDasharray="2 1" markerEnd="url(#arrow-amber)" />

        {/* state points */}
        <circle cx={p1.x} cy={p1.y} r={4.5} fill={chartPalette.blue} className="state-dot" />
        <circle cx={p2.x} cy={p2.y} r={4.5} fill={chartPalette.cyan} className="state-dot" />
        <circle cx={p3.x} cy={p3.y} r={4.5} fill={chartPalette.violet} className="state-dot" />
        <circle cx={p4.x} cy={p4.y} r={4.5} fill={chartPalette.amber} className="state-dot" />

        <text x={p1.x + 8} y={p1.y + 16} className="state-label">1</text>
        <text x={p2.x - 8} y={p2.y - 8} textAnchor="end" className="state-label">2</text>
        <text x={p3.x + 8} y={p3.y - 8} className="state-label">3</text>
        <text x={p4.x + 8} y={p4.y + 2} className="state-label">4</text>

        {/* axis names */}
        <text x={L + PW / 2} y={H - 14} textAnchor="middle" className="axis-label">
          Volume, V (m³)
        </text>
        <text
          x={16}
          y={T + PH / 2}
          textAnchor="middle"
          className="axis-label"
          transform={`rotate(-90 16 ${T + PH / 2})`}
        >
          Pressure, P (kPa)
        </text>
      </svg>

      <ul className="diagram-legend">
        <li><span className="legend-swatch" style={{ background: chartPalette.blue }} />1 → 2 Isentropic compression</li>
        <li><span className="legend-swatch" style={{ background: chartPalette.cyan }} />2 → 3 Constant-pressure heat addition</li>
        <li><span className="legend-swatch" style={{ background: chartPalette.violet }} />3 → 4 Isentropic expansion</li>
        <li><span className="legend-swatch" style={{ background: chartPalette.amber }} />4 → 1 Constant-volume heat rejection</li>
      </ul>
    </div>
  );
}