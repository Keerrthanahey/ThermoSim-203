import { Gauge, Waves, ArrowRight, Cpu, Zap } from 'lucide-react';
import { assignment } from '../data/assignment';
import { StatCard } from './StatCard';

export default function Hero() {
  const { diesel, rankine } = assignment;
  return (
    <section id="overview" className="hero">
      <div className="container">
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

        <div className="hero-stats">
          <StatCard label="Diesel Engine — swept volume" value={`${diesel.totalDisplacementL} L`} accent="blue" />
          <StatCard label="Cylinders" value={`${diesel.cylinders}`} hint={`${diesel.cycle}`} accent="blue" />
          <StatCard label="Engine speed" value={`${diesel.rpm} rpm`} accent="blue" />
          <StatCard label="Compression ratio" value={`r = ${diesel.compressionRatio}`} accent="blue" />

          <StatCard label="Rankine Plant — capacity" value={`${rankine.plantCapacityMW} MW`} accent="teal" />
          <StatCard label="Turbine inlet" value={`${rankine.turbineInletPressureMPa} MPa`} hint={`${rankine.turbineInletTemperatureC} °C`} accent="teal" />
          <StatCard label="Condenser pressure" value={`${rankine.condenserPressureKPa} kPa`} accent="teal" />
          <StatCard label="Cooling water" value="1200 kg/s" accent="teal" />
        </div>
      </div>
    </section>
  );
}