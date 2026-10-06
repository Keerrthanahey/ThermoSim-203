import { Gauge, Waves, ArrowRight, Cpu, Zap } from 'lucide-react';
import { assignment } from '../data/assignment';
import { StatCard } from './StatCard';
import type { Accent } from './StatCard';
import SplineScene from './SplineScene';
import ParticleField from './ParticleField';

export default function Hero() {
  const { diesel, rankine } = assignment;

  const statItems: Array<{ label: string; value: string; hint?: string; accent: Accent }> = [
    { label: 'Diesel swept volume', value: `${diesel.totalDisplacementL} L`, accent: 'blue' },
    { label: 'Cylinders', value: `${diesel.cylinders}`, hint: `${diesel.cycle}`, accent: 'blue' },
    { label: 'Engine speed', value: `${diesel.rpm} rpm`, accent: 'blue' },
    { label: 'Compression ratio', value: `r = ${diesel.compressionRatio}`, accent: 'blue' },
    { label: 'Plant capacity', value: `${rankine.plantCapacityMW} MW`, accent: 'teal' },
    { label: 'Turbine inlet', value: `${rankine.turbineInletPressureMPa} MPa`, hint: `${rankine.turbineInletTemperatureC} °C`, accent: 'teal' },
    { label: 'Condenser pressure', value: `${rankine.condenserPressureKPa} kPa`, accent: 'teal' },
    { label: 'Cooling water', value: `${rankine.coolingWaterMassFlowKgS} kg/s`, accent: 'teal' },
  ];

  return (
    <section id="overview" className="hero">
      <ParticleField />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-head">
          <div className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            {assignment.course} • {assignment.assignment} • {assignment.set}
          </div>

          <h1 className="hero-title">
            THERMOSIM <span className="hero-accent">203</span>
          </h1>
          <p className="hero-subtitle">{assignment.subtitle}</p>

          <div className="hero-meta">
            <span className="hero-meta-item">
              <Cpu size={16} aria-hidden="true" /> {assignment.courseName}
            </span>
            <span className="hero-meta-item">
              <Zap size={16} aria-hidden="true" /> {assignment.assignment} — {assignment.set}
            </span>
            <span className="hero-meta-item hero-meta-student">
              {assignment.studentId} {assignment.studentName}
            </span>
          </div>
        </div>

        <div className="hero-layout">
          <div className="hero-left">
            <div className="hero-cards">
              <a className="hero-card card-link accent-blue" href="#diesel">
                <span className="hero-card-icon" aria-hidden="true">
                  <Gauge size={22} />
                </span>
                <span className="hero-card-title">Ideal Diesel Cycle</span>
                <span className="hero-card-desc">
                  Four-cylinder two-stroke diesel engine · cold-air-standard cycle
                </span>
                <span className="hero-card-btn">
                  Open Simulation <ArrowRight size={16} aria-hidden="true" />
                </span>
              </a>

              <a className="hero-card card-link accent-teal" href="#rankine">
                <span className="hero-card-icon" aria-hidden="true">
                  <Waves size={22} />
                </span>
                <span className="hero-card-title">Ideal Rankine Cycle</span>
                <span className="hero-card-desc">
                  100 MW steam power plant · simple ideal Rankine cycle
                </span>
                <span className="hero-card-btn">
                  Open Simulation <ArrowRight size={16} aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>

          <div className="hero-right">
            <SplineScene />
          </div>
        </div>

        <div className="hero-stats">
          {statItems.map((item, i) => (
            <StatCard
              key={i}
              label={item.label}
              value={item.value}
              accent={item.accent}
              hint={item.hint}
            />
          ))}
        </div>
      </div>
    </section>
  );
}