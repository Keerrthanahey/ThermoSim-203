import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * RankineCycleAnimation — Process flow diagram of the Rankine cycle.
 * Shows the four main components (pump, boiler, turbine, condenser) with
 * animated fluid flow around the loop and component emphasis on hover.
 */

interface RankineCycleAnimationProps {
  isVisible?: boolean;
  plantCapacity?: number;
}

export default function RankineCycleAnimation({
  isVisible = true,
  plantCapacity = 100,
}: RankineCycleAnimationProps) {
  const [flowPhase, setFlowPhase] = useState(0);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setFlowPhase((p) => (p + 1) % 200);
    }, 40);

    return () => clearInterval(interval);
  }, [isVisible]);

  const components = [
    {
      id: 'pump',
      label: 'Pump',
      x: 80,
      y: 150,
      color: 'rgba(91, 157, 255, 0.7)',
      bgColor: 'rgba(91, 157, 255, 0.12)',
      description: 'State 1 → 2',
    },
    {
      id: 'boiler',
      label: 'Boiler',
      x: 240,
      y: 80,
      color: 'rgba(245, 185, 66, 0.7)',
      bgColor: 'rgba(245, 185, 66, 0.12)',
      description: 'State 2 → 3',
    },
    {
      id: 'turbine',
      label: 'Turbine',
      x: 400,
      y: 150,
      color: 'rgba(34, 211, 238, 0.7)',
      bgColor: 'rgba(34, 211, 238, 0.12)',
      description: 'State 3 → 4',
    },
    {
      id: 'condenser',
      label: 'Condenser',
      x: 240,
      y: 220,
      color: 'rgba(96, 165, 250, 0.7)',
      bgColor: 'rgba(96, 165, 250, 0.12)',
      description: 'State 4 → 1',
    },
  ];

  // Calculate flow position (0–1 around cycle)
  const t = flowPhase / 200;

  // Parametric path: pump → boiler → turbine → condenser → pump
  let flowX = 80;
  let flowY = 150;

  if (t < 0.25) {
    // Pump to boiler
    const s = t / 0.25;
    flowX = 80 + (240 - 80) * s;
    flowY = 150 + (80 - 150) * s;
  } else if (t < 0.5) {
    // Boiler to turbine
    const s = (t - 0.25) / 0.25;
    flowX = 240 + (400 - 240) * s;
    flowY = 80 + (150 - 80) * s;
  } else if (t < 0.75) {
    // Turbine to condenser
    const s = (t - 0.5) / 0.25;
    flowX = 400 + (240 - 400) * s;
    flowY = 150 + (220 - 150) * s;
  } else {
    // Condenser back to pump
    const s = (t - 0.75) / 0.25;
    flowX = 240 + (80 - 240) * s;
    flowY = 220 + (150 - 220) * s;
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-icon" aria-hidden="true">✧</div>
        <div>
          <h3 className="card-title">Rankine Cycle (Process Flow)</h3>
          <p className="card-subtitle" style={{ margin: '4px 0 0' }}>
            {plantCapacity} MW plant — Steady-flow ideal cycle
          </p>
        </div>
      </div>

      <svg
        viewBox="0 0 520 340"
        className="diagram-svg"
        style={{ height: '300px', marginTop: '16px' }}
        aria-label="Rankine cycle showing pump, boiler, turbine, and condenser components with flow animation"
      >
        {/* Background */}
        <defs>
          <pattern id="rankine-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(120,150,200,0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="520" height="340" fill="url(#rankine-grid)" />

        {/* Main cycle loop (dotted line) */}
        <path
          d="M 80 150 Q 160 50 240 80 Q 320 110 400 150 Q 320 230 240 220 Q 160 210 80 150"
          fill="none"
          stroke="rgba(120, 150, 200, 0.15)"
          strokeWidth="2"
          strokeDasharray="6,4"
        />

        {/* Component boxes */}
        {components.map((comp) => {
          const isActive = activeComponent === comp.id;

          return (
            <g
              key={comp.id}
              onMouseEnter={() => setActiveComponent(comp.id)}
              onMouseLeave={() => setActiveComponent(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Box background */}
              <motion.rect
                x={comp.x - 32}
                y={comp.y - 32}
                width="64"
                height="64"
                rx="8"
                fill={comp.bgColor}
                stroke={isActive ? comp.color : 'rgba(120, 150, 200, 0.2)'}
                strokeWidth={isActive ? 2 : 1}
                animate={{
                  boxShadow: isActive
                    ? `0 0 20px ${comp.color}`
                    : '0 0 0px transparent',
                }}
                transition={{ duration: 0.2 }}
              />

              {/* Icon circle */}
              <motion.circle
                cx={comp.x}
                cy={comp.y}
                r="18"
                fill={comp.color}
                opacity={isActive ? 0.9 : 0.6}
                animate={{
                  r: isActive ? 22 : 18,
                }}
                transition={{ duration: 0.2 }}
              />

              {/* Label */}
              <text
                x={comp.x}
                y={comp.y + 28}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={isActive ? comp.color : 'var(--text-dim)'}
                className="state-label"
              >
                {comp.label}
              </text>

              {/* Description */}
              <text
                x={comp.x}
                y={comp.y + 44}
                textAnchor="middle"
                fontSize="10"
                fill={isActive ? comp.color : 'var(--faint)'}
                fontFamily="monospace"
              >
                {comp.description}
              </text>
            </g>
          );
        })}

        {/* Animated flow marker */}
        <motion.circle
          cx={flowX}
          cy={flowY}
          r="8"
          fill="rgba(34, 211, 238, 0.95)"
          stroke="rgba(34, 211, 238, 1)"
          strokeWidth="2"
          animate={{
            boxShadow: [
              '0 0 12px rgba(34, 211, 238, 0.8)',
              '0 0 24px rgba(34, 211, 238, 0.4)',
              '0 0 12px rgba(34, 211, 238, 0.8)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Flow direction arrows */}
        <defs>
          <marker id="rankine-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="rgba(120, 150, 200, 0.3)" />
          </marker>
        </defs>

        {/* Arrow from pump to boiler */}
        <path
          d="M 140 110 Q 190 70 220 90"
          fill="none"
          stroke="rgba(120, 150, 200, 0.2)"
          strokeWidth="1.5"
          markerEnd="url(#rankine-arrow)"
        />

        {/* Arrow from boiler to turbine */}
        <path
          d="M 280 95 Q 340 110 360 140"
          fill="none"
          stroke="rgba(120, 150, 200, 0.2)"
          strokeWidth="1.5"
          markerEnd="url(#rankine-arrow)"
        />

        {/* Arrow from turbine to condenser */}
        <path
          d="M 360 200 Q 300 220 280 210"
          fill="none"
          stroke="rgba(120, 150, 200, 0.2)"
          strokeWidth="1.5"
          markerEnd="url(#rankine-arrow)"
        />

        {/* Arrow from condenser to pump */}
        <path
          d="M 200 210 Q 140 190 120 170"
          fill="none"
          stroke="rgba(120, 150, 200, 0.2)"
          strokeWidth="1.5"
          markerEnd="url(#rankine-arrow)"
        />

        {/* Title label */}
        <text x="260" y="310" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="monospace">
          Hover over components to highlight
        </text>
      </svg>

      <div className="diagram-legend">
        <li>
          <span className="legend-swatch" style={{ background: 'rgba(91, 157, 255, 0.7)', width: '8px', height: '8px', borderRadius: '50%' }} />
          Pump: Isentropic compression
        </li>
        <li>
          <span className="legend-swatch" style={{ background: 'rgba(245, 185, 66, 0.7)', width: '8px', height: '8px', borderRadius: '50%' }} />
          Boiler: Const-pressure heat addition
        </li>
        <li>
          <span className="legend-swatch" style={{ background: 'rgba(34, 211, 238, 0.7)', width: '8px', height: '8px', borderRadius: '50%' }} />
          Turbine: Isentropic expansion
        </li>
        <li>
          <span className="legend-swatch" style={{ background: 'rgba(96, 165, 250, 0.7)', width: '8px', height: '8px', borderRadius: '50%' }} />
          Condenser: Const-pressure heat rejection
        </li>
      </div>
    </div>
  );
}
