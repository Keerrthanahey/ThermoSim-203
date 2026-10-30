import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * DieselEngineAnimation — Mechanical visualization of a diesel engine.
 * Shows piston moving vertically and crankshaft rotating.
 * Conceptual illustration, not a physical simulation.
 */

interface EngineAnimationProps {
  isVisible?: boolean;
  rpm?: number;
}

export default function DieselEngineAnimation({ isVisible = true, rpm = 2400 }: EngineAnimationProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Calculate animation speed based on RPM
    const interval = setInterval(() => {
      setRotation((r) => (r + 2) % 360);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isVisible, rpm]);

  const crankRadius = 30;
  const rodLength = 80;

  // Calculate piston position based on crankshaft rotation
  // Simplified crankshaft-rod mechanism
  const crankAngleRad = (rotation * Math.PI) / 180;
  const crankX = crankRadius * Math.cos(crankAngleRad);
  const crankY = crankRadius * Math.sin(crankAngleRad);

  // Simple approximation for piston position
  const pistonY = -(crankY + Math.sqrt(rodLength * rodLength - crankX * crankX));

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-icon" aria-hidden="true">⚙</div>
        <div>
          <h3 className="card-title">Diesel Engine (Mechanical Model)</h3>
          <p className="card-subtitle" style={{ margin: '4px 0 0' }}>
            Conceptual visualization at {rpm} rpm
          </p>
        </div>
      </div>

      <svg
        viewBox="0 0 380 320"
        className="diagram-svg"
        style={{ height: '280px', marginTop: '16px' }}
        aria-label="Schematic of diesel engine showing piston, connecting rod, and crankshaft"
      >
        {/* Background grid */}
        <defs>
          <pattern id="engine-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(120,150,200,0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="380" height="320" fill="url(#engine-grid)" />

        {/* Cylinder block */}
        <rect x="100" y="60" width="40" height="140" fill="none" stroke="rgba(91,157,255,0.4)" strokeWidth="2" rx="4" />
        <text x="95" y="140" fontSize="11" fill="var(--muted)" textAnchor="end">
          Cylinder
        </text>

        {/* Piston (animated) */}
        <motion.rect
          x="110"
          y={100 + pistonY}
          width="20"
          height="30"
          fill="rgba(34, 211, 238, 0.7)"
          stroke="rgba(34, 211, 238, 0.9)"
          strokeWidth="1.5"
          rx="2"
        />

        {/* Piston rod */}
        <motion.line
          x1="120"
          y1={130 + pistonY}
          x2="180"
          y2="200"
          stroke="rgba(91, 157, 255, 0.6)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Crankshaft center */}
        <circle cx="180" cy="220" r="3" fill="rgba(120, 150, 200, 0.5)" />

        {/* Crank throw (animated) */}
        <motion.line
          x1="180"
          y1="220"
          x2={180 + crankX * 1.5}
          y2={220 + crankY * 1.5}
          stroke="rgba(245, 185, 66, 0.7)"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ transformOrigin: '180px 220px' }}
        />

        {/* Crankshaft crank pin (eccentric mass) */}
        <motion.circle
          cx={180 + crankX * 1.5}
          cy={220 + crankY * 1.5}
          r="5"
          fill="rgba(245, 185, 66, 0.8)"
          stroke="rgba(245, 185, 66, 0.95)"
          strokeWidth="1.5"
        />

        {/* Crankshaft main journals */}
        <circle cx="140" cy="220" r="6" fill="none" stroke="rgba(120,150,200,0.35)" strokeWidth="2" />
        <circle cx="220" cy="220" r="6" fill="none" stroke="rgba(120,150,200,0.35)" strokeWidth="2" />

        {/* Cylinder head / intake-exhaust annotation */}
        <text x="75" y="50" fontSize="12" fill="var(--cyan)" fontWeight="600">
          Intake
        </text>
        <text x="75" y="220" fontSize="12" fill="var(--amber)" fontWeight="600">
          Exhaust
        </text>

        {/* Info box */}
        <rect x="260" y="50" width="110" height="100" fill="rgba(10,17,32,0.7)" stroke="rgba(120,150,200,0.25)" strokeWidth="1" rx="6" />
        <text x="270" y="68" fontSize="12" fontWeight="600" fill="var(--cyan)" fontFamily="monospace">
          Engine Data
        </text>
        <text x="270" y="88" fontSize="11" fill="var(--text-dim)" fontFamily="monospace">
          Displacement: 2.4 L
        </text>
        <text x="270" y="104" fontSize="11" fill="var(--text-dim)" fontFamily="monospace">
          Cylinders: 4
        </text>
        <text x="270" y="120" fontSize="11" fill="var(--text-dim)" fontFamily="monospace">
          Cycle: 2-stroke
        </text>
        <text x="270" y="136" fontSize="11" fill="var(--cyan)" fontFamily="monospace">
          RPM: {rpm}
        </text>
      </svg>

      <div className="diagram-legend">
        <li>
          <span className="legend-swatch" style={{ background: 'rgba(34, 211, 238, 0.7)', width: '8px', height: '8px' }} />
          Piston
        </li>
        <li>
          <span className="legend-swatch" style={{ background: 'rgba(91, 157, 255, 0.6)', width: '3px', height: '14px' }} />
          Connecting rod
        </li>
        <li>
          <span className="legend-swatch" style={{ background: 'rgba(245, 185, 66, 0.7)', width: '3px', height: '14px' }} />
          Crankshaft throw
        </li>
      </div>

      <p className="diagram-note">
        This is a simplified, conceptual visualization. The actual engine geometry and dynamics are more complex.
      </p>
    </div>
  );
}
