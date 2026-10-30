import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Gauge, Thermometer, Droplets, Flame, Cog, ArrowDown, ArrowUp, RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';

function MouseTilt({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-1, 1], [4, -4]), { stiffness: 180, damping: 22 });
  const ry = useSpring(useTransform(x, [-1, 1], [-4, 4]), { stiffness: 180, damping: 22 });
  return (
    <motion.div className={className} style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX-r.left)/r.width*2-1); y.set((e.clientY-r.top)/r.height*2-1); }}
      onMouseLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.div>
  );
}

export function DieselCycleVisual() {
  const [angle, setAngle] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setAngle((a) => (a + 7) % 360), 45); return () => window.clearInterval(id); }, []);
  const piston = 20 + ((1 - Math.cos(angle * Math.PI / 180)) / 2) * 55;
  const crankX = 50 + Math.cos(angle * Math.PI / 180) * 18;
  const crankY = 150 + Math.sin(angle * Math.PI / 180) * 18;
  return (
    <MouseTilt className="cycle-visual diesel-visual">
      <div className="cycle-visual-head"><span>LIVE ENGINE MODEL</span><span className="live-dot" /> <span>2400 RPM</span></div>
      <svg viewBox="0 0 360 230" className="cycle-svg" role="img" aria-label="Animated diesel engine">
        <defs><linearGradient id="cyl" x1="0" y1="0" x2="1" y2="1"><stop offset="0"/><stop offset="1" stopColor="#142943"/></linearGradient></defs>
        <rect x="115" y="20" width="100" height="130" rx="9" fill="url(#cyl)" stroke="rgba(91,157,255,.65)" />
        <rect x="123" y={piston} width="84" height="25" rx="4" fill="rgba(91,157,255,.45)" stroke="#5b9dff" />
        <line x1="165" y1={piston+25} x2={crankX+165} y2={crankY} stroke="#22d3ee" strokeWidth="7" strokeLinecap="round" />
        <circle cx={crankX+165} cy={crankY} r="12" fill="none" stroke="#f5b942" strokeWidth="4" />
        <circle cx="165" cy="150" r="33" fill="none" stroke="rgba(120,150,200,.28)" strokeWidth="2" />
        <circle cx="165" cy="150" r="5" fill="#22d3ee" />
        <path d="M135 42 Q165 27 195 42" fill="none" stroke="#f5b942" strokeWidth="3" />
        <motion.path d="M138 56 C150 45 180 45 192 56" fill="none" stroke="#f87171" strokeWidth="3" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: .7, repeat: Infinity }} />
        <text x="30" y="205" fill="#7c8db0" fontSize="11">PISTON</text><text x="285" y="205" fill="#7c8db0" fontSize="11">CRANK</text>
      </svg>
      <div className="cycle-state-row"><span><Cog size={14}/> compression</span><span><Flame size={14}/> heat addition</span><span><RotateCw size={14}/> expansion</span></div>
    </MouseTilt>
  );
}

export function RankineCycleVisual() {
  const nodes = [
    { x: 40, y: 110, label: 'PUMP', icon: <Gauge size={15}/> },
    { x: 160, y: 45, label: 'BOILER', icon: <Flame size={15}/> },
    { x: 300, y: 110, label: 'TURBINE', icon: <RotateCw size={15}/> },
    { x: 160, y: 175, label: 'CONDENSER', icon: <Droplets size={15}/> },
  ];
  return (
    <MouseTilt className="cycle-visual rankine-visual">
      <div className="cycle-visual-head"><span>LIVE STEAM PLANT LOOP</span><span className="plant-badge">100 MW</span></div>
      <svg viewBox="0 0 380 235" className="cycle-svg" aria-label="Animated Rankine cycle">
        <path d="M62 105 L155 55 L285 105 L175 178 L62 105" fill="none" stroke="rgba(91,157,255,.22)" strokeWidth="7" />
        <motion.path d="M62 105 L155 55 L285 105 L175 178 L62 105" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="10 10" animate={{ strokeDashoffset: [0,-40] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} />
        {nodes.map((n) => <g key={n.label}><circle cx={n.x} cy={n.y} r="27" fill="#101b30" stroke="rgba(34,211,238,.42)"/><foreignObject x={n.x-15} y={n.y-19} width="30" height="30"><div className="cycle-node-icon">{n.icon}</div></foreignObject><text x={n.x} y={n.y+45} textAnchor="middle" fill="#a8b8d0" fontSize="10">{n.label}</text></g>)}
        <motion.circle cx="62" cy="105" r="4" fill="#f5b942" animate={{ cx: [62,155,285,175,62], cy: [105,55,105,178,105] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }} />
      </svg>
      <div className="cycle-state-row"><span><ArrowUp size={14}/> steam generation</span><span><RotateCw size={14}/> expansion</span><span><ArrowDown size={14}/> heat rejection</span></div>
    </MouseTilt>
  );
}

export function CycleVisualPair() {
  return <div className="cycle-visual-grid"><DieselCycleVisual/><RankineCycleVisual/></div>;
}
