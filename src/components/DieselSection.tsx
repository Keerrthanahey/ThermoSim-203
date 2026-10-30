import type { ColumnDef } from './ComparisonTable';
import { ComparisonTable } from './ComparisonTable';
import { NumberInput, SelectInput } from './FieldInputs';
import { SectionHeader } from './SectionHeader';
import { ResultCard, InfoChip } from './StatCard';
import { AssumptionsCard } from './AssumptionsCard';
import { InputCard } from './InputCard';
import DieselPVChart from './DieselPVChart';
import DieselCharts from './DieselCharts';
import { DieselStateTable } from './DieselStateTable';
import DieselCycleAnimation from './DieselCycleAnimation';
import DieselEngineAnimation from './DieselEngineAnimation';
import {
  SlidersHorizontal,
  RotateCcw,
  Flame,
  Gauge,
  Info,
  Activity,
  Settings2,
} from 'lucide-react';
import { assignment, DIESEL_ASSUMPTIONS } from '../data/assignment';
import type {
  CommentaryBlock,
  CycleType,
  DieselComparisonRow,
  DieselInputs,
  DieselResult,
} from '../lib/dieselCycle';
import { fmt, fmtPercent, fmtKJkg } from '../lib/formatters';

interface DieselSectionProps {
  inputs: DieselInputs;
  result: DieselResult;
  rows: DieselComparisonRow[];
  commentary: CommentaryBlock[];
  onInputChange: (field: keyof DieselInputs, value: number | CycleType) => void;
  onReset: () => void;
}

const dieselColumns: ColumnDef<DieselComparisonRow>[] = [
  { key: 'r', header: 'Compression Ratio', align: 'left', render: (row) => <strong>{row.compressionRatio}</strong> },
  { key: 't2', header: 'T₂ (°C)', align: 'right', render: (row) => fmt(row.t2C) },
  { key: 't3', header: 'T₃ (°C)', align: 'right', render: (row) => fmt(row.t3C) },
  { key: 't4', header: 'T₄ (°C)', align: 'right', render: (row) => fmt(row.t4C) },
  { key: 'qin', header: 'q_in (kJ/kg)', align: 'right', render: (row) => fmt(row.qInKJkg) },
  { key: 'qout', header: 'q_out (kJ/kg)', align: 'right', render: (row) => fmt(row.qOutKJkg) },
  { key: 'wnet', header: 'w_net (kJ/kg)', align: 'right', render: (row) => fmt(row.wNetKJkg) },
  { key: 'eta', header: 'η_th (%)', align: 'right', render: (row) => fmtPercent(row.etaThermal) },
  { key: 'power', header: 'Power (kW)', align: 'right', render: (row) => fmt(row.powerKW) },
];

export default function DieselSection({
  inputs,
  result,
  rows,
  commentary,
  onInputChange,
  onReset,
}: DieselSectionProps) {
  const issue = (field: keyof DieselInputs) =>
    result.issues.find((i) => i.field === field)?.message ?? null;

  return (
    <section id="diesel" className="section">
      <div className="container">
        <SectionHeader
          eyebrow={`${assignment.course} • ${assignment.assignment} • ${assignment.set}`}
          title={assignment.diesel.title}
          lede="Four-cylinder two-stroke 2.4 L diesel engine analysed on the cold-air-standard Diesel cycle. Adjust the inputs and every result, table and chart recomputes."
        />

        <div className="card problem-card">
          <div className="card-head">
            <span className="card-head-icon" aria-hidden="true">
              <Flame size={18} />
            </span>
            <h3 className="card-title">Assignment statement</h3>
          </div>
          <blockquote className="problem-quote">{assignment.diesel.problemStatement}</blockquote>
          <div className="spec-grid">
            <InfoChip label="Total displacement" value="2.4 L" />
            <InfoChip label="Cylinders" value="4" />
            <InfoChip label="Cycle" value="2-stroke" />
            <InfoChip label="Engine speed" value="2400 rpm" />
            <InfoChip label="Initial state" value="55 °C / 97 kPa" />
            <InfoChip label="Compression ratio" value="17" />
            <InfoChip label="Cutoff ratio" value="2.2" />
            <InfoChip label="Scenario ratios" value="17 · 19 · 21 · 23" />
          </div>
        </div>

        <div className="dash-grid">
          <InputCard
            title="Cycle Inputs"
            subtitle="Change any value to recompute the cycle"
            icon={<SlidersHorizontal size={18} aria-hidden="true" />}
          >
            <div className="fields-grid">
              <NumberInput
                id="d-disp"
                label="Total displacement"
                unit="L"
                value={inputs.totalDisplacementL}
                onChange={(v) => onInputChange('totalDisplacementL', v)}
                min={0}
                step={0.1}
                error={issue('totalDisplacementL')}
              />
              <NumberInput
                id="d-cyl"
                label="Number of cylinders"
                value={inputs.cylinders}
                onChange={(v) => onInputChange('cylinders', v)}
                min={1}
                step={1}
                error={issue('cylinders')}
              />
              <NumberInput
                id="d-rpm"
                label="Engine speed"
                unit="rpm"
                value={inputs.rpm}
                onChange={(v) => onInputChange('rpm', v)}
                min={1}
                step={100}
                error={issue('rpm')}
              />
              <NumberInput
                id="d-t1"
                label="Initial temperature"
                unit="°C"
                value={inputs.initialTemperatureC}
                onChange={(v) => onInputChange('initialTemperatureC', v)}
                min={-273.15}
                step={1}
                error={issue('initialTemperatureC')}
              />
              <NumberInput
                id="d-p1"
                label="Initial pressure"
                unit="kPa"
                value={inputs.initialPressureKPa}
                onChange={(v) => onInputChange('initialPressureKPa', v)}
                min={1}
                step={1}
                error={issue('initialPressureKPa')}
              />
              <NumberInput
                id="d-rc"
                label="Cutoff ratio"
                value={inputs.cutoffRatio}
                onChange={(v) => onInputChange('cutoffRatio', v)}
                min={1}
                step={0.1}
                error={issue('cutoffRatio')}
              />
              <NumberInput
                id="d-r"
                label="Compression ratio"
                value={inputs.compressionRatio}
                onChange={(v) => onInputChange('compressionRatio', v)}
                min={1}
                step={1}
                error={issue('compressionRatio')}
              />
              <SelectInput
                id="d-cycle"
                label="Cycle type"
                value={inputs.cycleType}
                onChange={(v) => onInputChange('cycleType', v as CycleType)}
                options={[
                  { value: '2-stroke', label: '2-stroke (power stroke every revolution)' },
                  { value: '4-stroke', label: '4-stroke (power stroke every two revolutions)' },
                ]}
              />
            </div>
            <button type="button" className="btn-reset" onClick={onReset}>
              <RotateCcw size={16} aria-hidden="true" />
              Reset to Assignment Values
            </button>
          </InputCard>

          <section className="card results-panel" aria-label="Diesel cycle results">
            <div className="card-head">
              <span className="card-head-icon" aria-hidden="true">
                <Gauge size={18} />
              </span>
              <div>
                <h3 className="card-title">Results — current operating point</h3>
                <p className="card-subtitle">
                  Operating point: r = {inputs.compressionRatio}, r_c = {inputs.cutoffRatio},{' '}
                  {inputs.rpm} rpm, {inputs.cycleType}
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
                    label="Power Output"
                    value={fmt(result.powerKW)}
                    unit="kW"
                    sub={`≈ ${fmt(result.powerMW, 3)} MW`}
                    accent="blue"
                  />
                </div>
                <div className="res-grid">
                  <ResultCard
                    label="Power Output"
                    value={fmt(result.powerMW, 3)}
                    unit="MW"
                    accent="blue"
                  />
                  <ResultCard
                    label="Thermal Efficiency"
                    value={fmtPercent(result.etaThermal)}
                    sub="η_th = w_net / q_in"
                    accent="teal"
                  />
                  <ResultCard
                    label="Net Specific Work"
                    value={fmtKJkg(result.wNetKJkg)}
                    accent="cyan"
                  />
                  <ResultCard
                    label="Air Mass / Cylinder / Cycle"
                    value={fmt(result.massPerCycleKg, 6)}
                    unit="kg"
                    accent="violet"
                  />
                  <ResultCard
                    label="Heat Input Rate"
                    value={fmt(result.heatInputRateKw)}
                    unit="kW"
                    accent="amber"
                  />
                  <ResultCard
                    label="Heat Rejection Rate"
                    value={fmt(result.heatRejectionRateKw)}
                    unit="kW"
                    accent="slate"
                  />
                </div>

                <div className="temp-strip" role="group" aria-label="Cycle state temperatures">
                  <span className="temp-strip-title">State temperatures</span>
                  {[
                    { name: 'T₁', c: result.t1C, k: result.t1K },
                    { name: 'T₂', c: result.t2C, k: result.t2K },
                    { name: 'T₃', c: result.t3C, k: result.t3K },
                    { name: 'T₄', c: result.t4C, k: result.t4K },
                  ].map((s) => (
                    <div className="temp-item" key={s.name}>
                      <span className="temp-item-name">{s.name}</span>
                      <b>{fmt(s.c, 1)} °C</b>
                      <small>{fmt(s.k, 1)} K</small>
                    </div>
                  ))}
                </div>

                <div className="detail-chips">
                  <InfoChip label="Power strokes / s" value={fmt(result.powerStrokesPerSecond, 1)} />
                  <InfoChip label="Work / power stroke" value={`${fmt(result.workPerCycleKJ, 4)} kJ`} />
                  <InfoChip label="Swept volume" value={`${fmt(result.totalSweptVolumeM3, 4)} m³`} />
                  <InfoChip label="Per-cylinder swept vol." value={`${fmt(result.perCylinderSweptVolumeM3, 5)} m³`} />
                  <InfoChip label="Clearance volume V₂" value={`${fmt(result.clearanceVolumeM3, 6)} m³`} />
                  <InfoChip label="Max volume V₁" value={`${fmt(result.maxVolumeM3, 5)} m³`} />
                  <InfoChip label="Pressure P₂ = P₃" value={`${fmt(result.p2KPa)} kPa`} />
                  <InfoChip label="Pressure P₄" value={`${fmt(result.p4KPa)} kPa`} />
                </div>
              </>
            )}
          </section>
        </div>

        {/* Animated Diesel Cycle & Engine Visualizations */}
        <div className="dash-grid">
          <DieselCycleAnimation isVisible={true} />
          <DieselEngineAnimation isVisible={true} rpm={inputs.rpm} />
        </div>

        <div className="dash-grid">
          <AssumptionsCard
            title="Cold-Air-Standard Assumptions"
            icon={<Settings2 size={18} aria-hidden="true" />}
            items={DIESEL_ASSUMPTIONS}
            accent="blue"
          />
          <section className="card" aria-label="P–V diagram">
            <div className="card-head">
              <span className="card-head-icon" aria-hidden="true">
                <Activity size={18} />
              </span>
              <h3 className="card-title">Diesel Cycle P–V Diagram</h3>
            </div>
            <DieselPVChart result={result} />
          </section>
        </div>

        <DieselStateTable result={result} />

        <DieselCharts rows={rows} />

        <section className="card commentary-card">
          <div className="card-head">
            <span className="card-head-icon" aria-hidden="true">
              <Gauge size={18} />
            </span>
            <div>
              <h3 className="card-title">Engineering interpretation</h3>
              <p className="card-subtitle">
                Auto-generated from the scenario results — compare r = 17 and r = 23
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

        <ComparisonTable
          caption="Scenario comparison — compression-ratio sweeps (all values calculated live)"
          note="Scenario list r = 17, 19, 21, 23 from the assignment. Base case uses the same swept volume, bore inputs and 2400 rpm for each ratio."
          columns={dieselColumns}
          rows={rows}
        />
      </div>
    </section>
  );
}
