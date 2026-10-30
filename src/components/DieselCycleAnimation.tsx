import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * DieselCycleAnimation — Interactive visualization of the Diesel cycle on a P–V diagram.
 * Shows the four state points (1, 2, 3, 4) and animated flow around the cycle.
 *
 * Processes:
 * - 1 → 2: Isentropic compression (steep rise)
 * - 2 → 3: Constant-pressure heat addition (horizontal)
 * - 3 → 4: Isentropic expansion (steep drop)
 * - 4 → 1: Constant-volume heat rejection (vertical drop)
 */

interface DiagramProps {
  isVisible?: boolean;
}

export default function DieselCycleAnimation({ isVisible = true }: DiagramProps) {
  const [cyclePhase, setCyclePhase] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCyclePhase((p) => (p + 1) % 200);
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Normalize phase to 0–1 for animation
  const phase = cyclePhase / 200;

  // Parametric P–V cycle (normalized, 0–1)
  // State points: 1 (bottom-left), 2 (top-left), 3 (top-right), 4 (bottom-right)
  const p1 = 0.15;
  const v1 = 0.1;
  const p2 = 0.85;
  const v2 = 0.1;
  const p3 = 0.85;
  const v3 = 0.4;
  const p4 = 0.20;
  const v4 = 0.4;

  // Get current position on cycle
  let currentP = p1;
  let currentV = v1;
  let currentProcess = '1 → 2';

  if (phase < 0.25) {
    // Process 1 → 2: Isentropic compression (vertical on V, steep P rise)
    const t = phase / 0.25;
    currentV = v1 + (v2 - v1) * t;
    currentP = p1 + (p2 - p1) * (t * t); // Steep curve
    currentProcess = '1 → 2: Isentropic compression';
  } else if (phase < 0.5) {
    // Process 2 → 3: Constant-pressure heat addition (horizontal on P, V increases)
    const t = (phase - 0.25) / 0.25;
    currentV = v2 + (v3 - v2) * t;
    currentP = p2; // Constant
    currentProcess = '2 → 3: Const-pressure heat addition';
  } else if (phase < 0.75) {
    // Process 3 → 4: Isentropic expansion (steep P drop, V decreases)
    const t = (phase - 0.5) / 0.25;
    currentV = v3 + (v4 - v3) * t;
    currentP = p3 - (p3 - p4) * (t * t); // Steep curve
    currentProcess = '3 → 4: Isentropic expansion';
  } else {
    // Process 4 → 1: Constant-volume heat rejection (vertical on V, P drops)
    const t = (phase - 0.75) / 0.25;
    currentV = v4; // Constant
    currentP = p4 + (p1 - p4) * t;
    currentProcess = '4 → 1: Const-volume heat rejection';
  }

  // SVG coordinates (0–1 normalized, then scale to viewBox)
  const xToSvg = (v: number) => v * 800 + 40;
  const yToSvg = (p: number) => 500 - p * 400 + 20;

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-icon" aria-hidden="true">P</div>
        <div>
          <h3 className="card-title">Diesel Cycle (P–V Diagram)</h3>
          <p className="card-subtitle" style={{ margin: '4px 0 0' }}>
            {currentProcess}
          </p>
        </div>
      </div>

      <svg
        viewBox="0 0 880 540"
        className="diagram-svg"
        style={{ height: '300px', marginTop: '16px' }}
        aria-label="P-V diagram showing the Diesel cycle with the four state points and processes"
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 40" fill="none" stroke="rgba(120,150,200,0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="880" height="540" fill="url(#grid)" />

        {/* Axes */}
        <line x1="40" y1="520" x2="840" y2="520" stroke="rgba(150,175,215,0.45)" strokeWidth="1.2" />
        <line x1="40" y1="520" x2="40" y2="20" stroke="rgba(150,175,215,0.45)" strokeWidth="1.2" />

        {/* Axis labels */}
        <text x="820" y="540" className="axis-label" textAnchor="end">
          Specific Volume (V)
        </text>
        <text x="25" y="35" className="axis-label" textAnchor="end">
          Pressure (P)
        </text>

        {/* Cycle path */}
        <path
          d={`M ${xToSvg(v1)} ${yToSvg(p1)} 
             Q ${xToSvg(v2)} ${yToSvg((p1 + p2) / 2)} ${xToSvg(v2)} ${yToSvg(p2)}
             L ${xToSvg(v3)} ${yToSvg(p3)}
             Q ${xToSvg((v3 + v4) / 2)} ${yToSvg((p3 + p4) / 2)} ${xToSvg(v4)} ${yToSvg(p4)}
             Z`}
          fill="rgba(91, 157, 255, 0.06)"
          stroke="rgba(91, 157, 255, 0.5)"
          strokeWidth="2"
        />

        {/* State point dots */}
        {[
          { v: v1, p: p1, label: '1' },
          { v: v2, p: p2, label: '2' },
          { v: v3, p: p3, label: '3' },
          { v: v4, p: p4, label: '4' },
        ].map((state) => (
          <g key={state.label}>
            <circle
              cx={xToSvg(state.v)}
              cy={yToSvg(state.p)}
              r="5"
              fill="rgba(34, 211, 238, 0.9)"
              stroke="rgba(10, 17, 32, 0.9)"
              strokeWidth="1.5"
              className="state-dot"
            />
            <text
              x={xToSvg(state.v)}
              y={yToSvg(state.p) - 14}
              className="state-label"
              textAnchor="middle"
            >
              {state.label}
            </text>
          </g>
        ))}

        {/* Animated marker */}
        <motion.circle
          cx={xToSvg(currentV)}
          cy={yToSvg(currentP)}
          r="6"
          fill="rgba(245, 185, 66, 0.8)"
          stroke="rgba(245, 185, 66, 1)"
          strokeWidth="2"
          animate={{
            boxShadow: [
              '0 0 10px rgba(245, 185, 66, 0.6)',
              '0 0 20px rgba(245, 185, 66, 0.3)',
              '0 0 10px rgba(245, 185, 66, 0.6)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Process arrows */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="rgba(91, 157, 255, 0.35)" />
          </marker>
        </defs>
        <line
          x1={xToSvg(v2 - 0.05)}
          y1={yToSvg(p2 + 0.05)}
          x2={xToSvg(v3 + 0.05)}
          y2={yToSvg(p3 + 0.05)}
          stroke="rgba(91, 157, 255, 0.3)"
          strokeWidth="1.5"
          markerEnd="url(#arrowhead)"
        />
      </svg>

      <div className="diagram-legend">
        <li>
          <span className="legend-swatch" style={{ background: 'rgba(91, 157, 255, 0.5)' }} />
          Cycle boundary
        </li>
        <li>
          <span className="legend-swatch" style={{ background: 'rgba(34, 211, 238, 0.9)', width: '6px', height: '6px', borderRadius: '50%' }} />
          State points
        </li>
        <li>
          <span className="legend-swatch" style={{ background: 'rgba(245, 185, 66, 0.8)', width: '6px', height: '6px', borderRadius: '50%' }} />
          Current position
        </li>
      </div>
    </div>
  );
}
