import type { ColumnDef } from './ComparisonTable';
import { ComparisonTable } from './ComparisonTable';
import { NumberInput } from './FieldInputs';
import { SectionHeader } from './SectionHeader';
import { ResultCard, InfoChip } from './StatCard';
import { StateTable } from './StateTable';
import { InputCard } from './InputCard';
import RankineTSChart from './RankineTSChart';
import RankineCharts from './RankineCharts';
import RankineCycleAnimation from './RankineCycleAnimation';
import {
  SlidersHorizontal,
  RotateCcw,
  Droplets,
  Waves,
  Info,
  Library,
  AlertTriangle,
  Settings2,
} from 'lucide-react';
import { assignment, RANKINE_ASSUMPTIONS } from '../data/assignment';
import { STEAM_MODEL_DOC, SATURATED_WATER_10KPA, STEAM_TURBINE_INLET_REF } from '../lib/steamProperties';
import type { RankineComparisonRow, RankineInputs, RankineResult } from '../lib/rankineCycle';
import type { CommentaryBlock } from '../lib/rankineCycle';
import { fmt, fmtPercent, fmtKJkg } from '../lib/formatters';
import { AssumptionsCard } from './AssumptionsCard';

interface RankineSectionProps {
  inputs: RankineInputs;
  result: RankineResult;
  rows: RankineComparisonRow[];
  commentary: CommentaryBlock[];
  onInputChange: (field: keyof RankineInputs, value: number) => void;
  onReset: () => void;
}

const rankineColumns: ColumnDef<RankineComparisonRow>[] = [
  { key: 'cap', header: 'Plant Capacity', align: 'left', render: (row) => <strong>{row.plantCapacityMW} MW</strong> },
  { key: 'eta', header: 'Thermal Efficiency', align: 'right', render: (row) => fmtPercent(row.etaThermal) },
  { key: 'flow', header: 'Steam Flow (kg/s)', align: 'right', render: (row) => fmt(row.steamMassFlowKgS) },
  { key: 'dTcw', header: 'Cooling Water ΔT (°C)', align: 'right', render: (row) => fmt(row.dTcwC) },
  { key: 'qout', header: 'Condenser Heat Rejected (MW)', align: 'right', render: (row) => fmt(row.heatRejectedMW, 1) },
];

export default function RankineSection({
  inputs,
  result,
  rows,
  commentary,
  onInputChange,
  onReset,
}: RankineSectionProps) {
  const issue = (field: keyof RankineInputs) =>
    result.issues.find((i) => i.field === field)?.message ?? null;

  return (
    <section id="rankine" className="section">
      <div className="container">
        <SectionHeader
          eyebrow={`${assignment.course} • ${assignment.assignment} • ${assignment.set}`}
          title={assignment.rankine.title}
          lede="100 MW steam power plant on the simple ideal Rankine cycle. Live calculation of thermal efficiency, steam mass flow and condenser cooling-water temperature rise."
        />

        <div className="card problem-card">
          <div className="card-head">
            <span className="card-head-icon" aria-hidden="true">
              <Droplets size={18} />
            </span>
            <h3 className="card-title">Assignment statement</h3>
          </div>
          <blockquote className="problem-quote">{assignment.rankine.problemStatement}</blockquote>
          <div className="spec-grid">
            <InfoChip label="Plant capacity" value="100 MW" />
            <InfoChip label="Turbine inlet" value="7 MPa / 500 °C" />
            <InfoChip label="Condenser pressure" value="10 kPa" />
            <InfoChip label="Cooling water" value="1200 kg/s" />
            <InfoChip label="Cooling water c_p" value="4.18 kJ/kg·K" />
            <InfoChip label="Capacity scenarios" value="100 · 200 · 300 · 400 MW" />
          </div>
        </div>

        {(result.usesApproxCondenserProps || result.usesApproxTurbineInlet) && (
          <div className="notice-banner warning">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>
              Turbine-inlet or condenser inputs differ from the assignment state points, so the
              property module has switched to the documented approximation anchored to the
              steam-table values (it is not a general-purpose steam-property solver).
            </span>
          </div>
        )}

        {result.valid && commentary.length > 0 && (
          <section className="card commentary-card">
            <div className="card-head">
              <span className="card-head-icon" aria-hidden="true">
                <Waves size={18} />
              </span>
              <div>
                <h3 className="card-title">Engineering interpretation</h3>
                <p className="card-subtitle">
                  Auto-generated from the calculated results — compare 100 MW and{' '}
                  {rows[rows.length - 1]?.plantCapacityMW} MW
                </p>
              </div>
            </div>
            <div className="commentary-block">
              {commentary.map((block) => (
                <article className="commentary-item" key={block.title}>
                  <h4 className="commentary-title">{block.title}</h4>
                  <p className="commentary-body">{block.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="dash-grid">
          <InputCard
            title="Plant Inputs"
            subtitle="Change any value to recompute the cycle"
            icon={<SlidersHorizontal size={18} aria-hidden="true" />}
          >
            <div className="fields-grid">
              <NumberInput
                id="r-cap"
                label="Plant capacity"
                unit="MW"
                value={inputs.plantCapacityMW}
                onChange={(v) => onInputChange('plantCapacityMW', v)}
                min={1}
                step={50}
                error={issue('plantCapacityMW')}
              />
              <NumberInput
                id="r-p3"
                label="Turbine inlet pressure"
                unit="MPa"
                value={inputs.turbineInletPressureMPa}
                onChange={(v) => onInputChange('turbineInletPressureMPa', v)}
                min={0.01}
                step={0.5}
                error={issue('turbineInletPressureMPa')}
              />
              <NumberInput
                id="r-t3"
                label="Turbine inlet temperature"
                unit="°C"
                value={inputs.turbineInletTemperatureC}
                onChange={(v) => onInputChange('turbineInletTemperatureC', v)}
                min={0}
                step={10}
                error={issue('turbineInletTemperatureC')}
              />
              <NumberInput
                id="r-p1"
                label="Condenser pressure"
                unit="kPa"
                value={inputs.condenserPressureKPa}
                onChange={(v) => onInputChange('condenserPressureKPa', v)}
                min={0.1}
                step={1}
                error={issue('condenserPressureKPa')}
              />
              <NumberInput
                id="r-mcw"
                label="Cooling water flow rate"
                unit="kg/s"
                value={inputs.coolingWaterMassFlowKgS}
                onChange={(v) => onInputChange('coolingWaterMassFlowKgS', v)}
                min={1}
                step={100}
                error={issue('coolingWaterMassFlowKgS')}
              />
              <NumberInput
                id="r-cpw"
                label="Cooling water specific heat"
                unit="kJ/kg·K"
                value={inputs.coolingWaterCp}
                onChange={(v) => onInputChange('coolingWaterCp', v)}
                min={0.1}
                step={0.01}
                error={issue('coolingWaterCp')}
              />
            </div>
            <button type="button" className="btn-reset" onClick={onReset}>
              <RotateCcw size={16} aria-hidden="true" />
              Reset to Assignment Values
            </button>
          </InputCard>

          <section className="card results-panel" aria-label="Rankine cycle results">
            <div className="card-head">
              <span className="card-head-icon" aria-hidden="true">
                <Waves size={18} />
              </span>
              <div>
                <h3 className="card-title">Results — {inputs.plantCapacityMW} MW plant</h3>
                <p className="card-subtitle">
                  {inputs.turbineInletPressureMPa} MPa / {inputs.turbineInletTemperatureC} °C →
                  10 kPa condenser
                </p>
              </div>
            </div>

            {!result.valid ? (
              <div className="issue-box" role="alert">
                <span className="issue-box-title">
                  <Info size={16} aria-hidden="true" /> Adjust the inputs to calculate
                </span>
                <ul>
                  {result.issues.map((i, idx) => (
                    <li key={idx}>{i.message}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <div className="res-hero">
                  <ResultCard
                    large
                    label="Net Plant Output"
                    value={fmt(result.valid ? inputs.plantCapacityMW : 0)}
                    unit="MW"
                    sub="input to the calculation"
                    accent="teal"
                  />
                </div>
                <div className="res-grid">
                  <ResultCard label="Thermal Efficiency" value={fmtPercent(result.etaThermal)} accent="teal" />
                  <ResultCard label="Steam Mass Flow" value={fmt(result.steamMassFlowKgS)} unit="kg/s" accent="blue" />
                  <ResultCard label="Cooling-Water ΔT" value={fmt(result.dTcwC)} unit="°C" accent="cyan" />
                  <ResultCard label="Turbine Work" value={fmtKJkg(result.wtKJkg)} accent="blue" />
                  <ResultCard label="Pump Work" value={fmtKJkg(result.wpKJkg)} accent="slate" />
                  <ResultCard label="Net Specific Work" value={fmtKJkg(result.wNetKJkg)} accent="cyan" />
                  <ResultCard label="Heat Added" value={fmtKJkg(result.qInKJkg)} accent="amber" />
                  <ResultCard label="Heat Rejected" value={fmtKJkg(result.qOutKJkg)} accent="violet" />
                </div>

                <div className="detail-chips">
                  <InfoChip label="Condenser temperature" value={`${fmt(result.tsatC)} °C`} />
                  <InfoChip label="Turbine exhaust quality x₄" value={fmt(result.x4, 4)} />
                  <InfoChip label="Heat rejected" value={`${fmt(result.heatRejectedMW, 1)} MW`} />
                  <InfoChip label="Boiler heat input" value={`${fmt(result.heatInputMW, 1)} MW`} />
                </div>
              </>
            )}
          </section>
        </div>

        {/* Rankine Cycle Process Animation */}
        <RankineCycleAnimation isVisible={true} plantCapacity={inputs.plantCapacityMW} />

        <div className="dash-grid">
          <div className="dash-stack">
            <section className="card">
              <div className="card-head">
                <span className="card-head-icon" aria-hidden="true">
                  <Library size={18} />
                </span>
                <h3 className="card-title">Steam Property Basis</h3>
              </div>
              <p className="card-note">{STEAM_MODEL_DOC.base}</p>
              <ul className="prop-list">
                <li>
                  Turbine inlet ({STEAM_TURBINE_INLET_REF.pMPa} MPa, {STEAM_TURBINE_INLET_REF.tC} °C):
                  h = {STEAM_TURBINE_INLET_REF.h} kJ/kg, s = {STEAM_TURBINE_INLET_REF.s} kJ/kg·K
                </li>
                <li>
                  Condenser ({SATURATED_WATER_10KPA.pressureKPa} kPa): Tsat ={' '}
                  {SATURATED_WATER_10KPA.TsatC} °C, hf = {SATURATED_WATER_10KPA.hf} kJ/kg, hfg ={' '}
                  {SATURATED_WATER_10KPA.hfg} kJ/kg, sf = {SATURATED_WATER_10KPA.sf} kJ/kg·K, sfg ={' '}
                  {SATURATED_WATER_10KPA.sfg} kJ/kg·K, vf = {SATURATED_WATER_10KPA.vf} m³/kg
                </li>
                <li>
                  Pump work uses w_p = v_f · ΔP with a constant liquid density approximation
                  (incompressible liquid).
                </li>
              </ul>
              <p className="proc-note">{STEAM_MODEL_DOC.approximation}</p>
            </section>

            <AssumptionsCard
              title="Rankine Cycle Assumptions"
              icon={<Settings2 size={18} />}
              items={RANKINE_ASSUMPTIONS}
              accent="teal"
            />
          </div>

          <section className="card" aria-label="T-s diagram">
            <div className="card-head">
              <span className="card-head-icon" aria-hidden="true">
                <Waves size={18} />
              </span>
              <h3 className="card-title">Rankine Cycle T–s Diagram</h3>
            </div>
            <RankineTSChart result={result} />
          </section>
        </div>

        <div className="dash-grid">
          <StateTable result={result} />
          <section className="card">
            <div className="card-head">
              <span className="card-head-icon" aria-hidden="true">
                <Info size={18} />
              </span>
              <h3 className="card-title">Cycle performance at {inputs.plantCapacityMW} MW</h3>
            </div>
            {result.valid ? (
              <ul className="prop-list">
                <li>
                  Thermal efficiency η = w_net / q_in = {fmtKJkg(result.wNetKJkg)} ÷{' '}
                  {fmtKJkg(result.qInKJkg)} = <strong>{fmtPercent(result.etaThermal)}</strong>.
                </li>
                <li>
                  Steam flow ṁ_steam = Ẇ_plant / w_net = ({inputs.plantCapacityMW} × 1000 kW) ÷{' '}
                  {fmtKJkg(result.wNetKJkg)} = <strong>{fmt(result.steamMassFlowKgS)} kg/s</strong>.
                </li>
                <li>
                  Condenser duty Q̇_out = ṁ_steam · q_out ={' '}
                  <strong>{fmt(result.heatRejectedMW, 1)} MW</strong>.
                </li>
                <li>
                  Cooling-water rise ΔT_cw = Q̇_out / (ṁ_cw · c_p,w) ={' '}
                  <strong>{fmt(result.dTcwC)} °C</strong> with ṁ_cw ={' '}
                  {inputs.coolingWaterMassFlowKgS} kg/s and c_p,w = {inputs.coolingWaterCp} kJ/kg·K.
                </li>
                <li>
                  {result.tubeOutletSuperheated
                    ? 'The computed turbine-exhaust entropy exceeds the saturated-vapour value at the condenser pressure, indicating a superheated exhaust would result (beyond the saturated-mixture assumption).'
                    : `Turbine exhaust quality x₄ = ${fmt(result.x4, 4)} (saturated mixture at ${fmt(result.tsatC)} °C).`}
                </li>
              </ul>
            ) : (
              <p className="card-note">Valid inputs are required to compute the cycle performance.</p>
            )}
          </section>
        </div>

        <ComparisonTable
          caption="Scenario comparison — plant capacities (all values calculated live)"
          note="Steam flow scales linearly with capacity because w_net is fixed per kg; the cooling-water rise scales the same way since the cooling flow of 1200 kg/s is held constant."
          columns={rankineColumns}
          rows={rows}
        />

        <RankineCharts rows={rows} result={result} />
      </div>
    </section>
  );
}
