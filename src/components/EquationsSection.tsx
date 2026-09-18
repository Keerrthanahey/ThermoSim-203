import { SectionHeader } from './SectionHeader';
import { EquationCard } from './EquationCard';
import { AssumptionsCard } from './AssumptionsCard';
import { InfoChip } from './StatCard';
import { FunctionSquare, Settings2, BookOpen, Ruler } from 'lucide-react';
import { DIESEL_ASSUMPTIONS, RANKINE_ASSUMPTIONS } from '../data/assignment';
import { AIR } from '../lib/dieselCycle';
import { SATURATED_WATER_10KPA, STEAM_TURBINE_INLET_REF } from '../lib/steamProperties';

const dieselEquations = [
  { name: 'Compression ratio', math: 'r = V<sub>1</sub> / V<sub>2</sub>' },
  { name: 'Clearance volume', math: 'V<sub>2</sub> = V<sub>d</sub> / (r − 1)' },
  { name: 'Trapped air mass', math: 'm = P<sub>1</sub>V<sub>1</sub> / (R&#8202;T<sub>1</sub>)' },
  { name: 'Isentropic compression', math: 'T<sub>2</sub> = T<sub>1</sub>&#8202;r<sup>k−1</sup>' },
  { name: 'Constant-pressure heat addition', math: 'T<sub>3</sub> = T<sub>2</sub>&#8202;r<sub>c</sub>' },
  { name: 'Isentropic expansion', math: 'T<sub>4</sub> = T<sub>3</sub>&#8202;(r<sub>c</sub>/r)<sup>k−1</sup>' },
  { name: 'Heat added', math: 'q<sub>in</sub> = c<sub>p</sub>(T<sub>3</sub> − T<sub>2</sub>)' },
  { name: 'Heat rejected', math: 'q<sub>out</sub> = c<sub>v</sub>(T<sub>4</sub> − T<sub>1</sub>)' },
  { name: 'Net specific work', math: 'w<sub>net</sub> = q<sub>in</sub> − q<sub>out</sub>' },
  { name: 'Thermal efficiency', math: 'η = w<sub>net</sub> / q<sub>in</sub>' },
  {
    name: 'Engine power (2-stroke)',
    math: 'W&#775; = w<sub>net</sub> · m · N<sub>cyl</sub> · (RPM / 60)',
  },
];

const rankineEquations = [
  { name: 'Pump work (incompressible liquid)', math: 'w<sub>p</sub> = v<sub>f</sub>(P<sub>2</sub> − P<sub>1</sub>)' },
  { name: 'Pump outlet enthalpy', math: 'h<sub>2</sub> = h<sub>1</sub> + w<sub>p</sub>' },
  { name: 'Turbine exhaust quality', math: 'x<sub>4</sub> = (s<sub>3</sub> − s<sub>f</sub>) / s<sub>fg</sub>' },
  { name: 'Turbine exhaust enthalpy', math: 'h<sub>4</sub> = h<sub>f</sub> + x<sub>4</sub>&#8202;h<sub>fg</sub>' },
  { name: 'Turbine work', math: 'w<sub>t</sub> = h<sub>3</sub> − h<sub>4</sub>' },
  { name: 'Net specific work', math: 'w<sub>net</sub> = w<sub>t</sub> − w<sub>p</sub>' },
  { name: 'Boiler heat input', math: 'q<sub>in</sub> = h<sub>3</sub> − h<sub>2</sub>' },
  { name: 'Thermal efficiency', math: 'η = w<sub>net</sub> / q<sub>in</sub>' },
  { name: 'Steam mass flow', math: 'ṁ<sub>steam</sub> = W&#775;<sub>plant</sub> / w<sub>net</sub>' },
  { name: 'Condenser heat rejection', math: 'Q&#775;<sub>out</sub> = ṁ<sub>steam</sub>(h<sub>4</sub> − h<sub>1</sub>)' },
  { name: 'Cooling-water temperature rise', math: 'ΔT<sub>cw</sub> = Q&#775;<sub>out</sub> / (ṁ<sub>cw</sub>&#8202;c<sub>p,w</sub>)' },
];

export default function EquationsSection() {
  return (
    <section id="equations" className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Reference material"
          title="Equations & Assumptions"
          lede="The governing equations implemented in the calculation engine, the assumptions behind them, and the constants and property values used."
        />

        <div className="dash-grid">
          <EquationCard
            title="Diesel Cycle — Governing Equations"
            icon={<FunctionSquare size={18} aria-hidden="true" />}
            equations={dieselEquations}
            note="For a 4-stroke engine the power expression uses (RPM / 120) per cylinder because each cylinder fires once every two revolutions."
          />
          <EquationCard
            title="Rankine Cycle — Governing Equations"
            icon={<BookOpen size={18} aria-hidden="true" />}
            equations={rankineEquations}
            note="Steam properties come from standard steam-table values at the assignment state points (turbine inlet 7 MPa, 500 °C; condenser 10 kPa)."
          />
        </div>

        <div className="dash-grid">
          <AssumptionsCard
            title="Diesel Cycle Assumptions"
            icon={<Settings2 size={18} aria-hidden="true" />}
            items={DIESEL_ASSUMPTIONS}
            accent="blue"
          />
          <AssumptionsCard
            title="Rankine Cycle Assumptions"
            icon={<Settings2 size={18} aria-hidden="true" />}
            items={RANKINE_ASSUMPTIONS}
            accent="teal"
          />
        </div>

        <section className="card">
          <div className="card-head">
            <span className="card-head-icon" aria-hidden="true">
              <Ruler size={18} />
            </span>
            <h3 className="card-title">Constants, Properties & Unit Conventions</h3>
          </div>
          <div className="spec-grid">
            <InfoChip label="k (air)" value={`${AIR.k}`} />
            <InfoChip label="R (air)" value={`${AIR.R} kJ/kg·K`} />
            <InfoChip label="c_p (air)" value={`${AIR.cp} kJ/kg·K`} />
            <InfoChip label="c_v (air)" value={`${AIR.cv} kJ/kg·K`} />
            <InfoChip label="Turbine inlet" value={`h = ${STEAM_TURBINE_INLET_REF.h} kJ/kg`} />
            <InfoChip label="Turbine inlet" value={`s = ${STEAM_TURBINE_INLET_REF.s} kJ/kg·K`} />
            <InfoChip label="10 kPa hf" value={`${SATURATED_WATER_10KPA.hf} kJ/kg`} />
            <InfoChip label="10 kPa hfg" value={`${SATURATED_WATER_10KPA.hfg} kJ/kg`} />
            <InfoChip label="10 kPa sf" value={`${SATURATED_WATER_10KPA.sf} kJ/kg·K`} />
            <InfoChip label="10 kPa sfg" value={`${SATURATED_WATER_10KPA.sfg} kJ/kg·K`} />
          </div>
          <p className="card-note">
            Unit conventions: pressure in kPa (MPa × 1000), volume in m³ (L ÷ 1000), temperature in K
            (°C + 273.15), energy in kJ. Because 1 kPa·m³ = 1 kJ, the product P·V with P in kPa and V
            in m³ yields kJ directly, so w_net (kJ/kg) × ṁ (kg/s) gives kW.
          </p>
        </section>
      </div>
    </section>
  );
}