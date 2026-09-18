import { SectionHeader } from './SectionHeader';
import { InfoChip } from './StatCard';
import { Activity, Gauge, Waves } from 'lucide-react';
import { assignment } from '../data/assignment';
import type { DieselComparisonRow, DieselInputs } from '../lib/dieselCycle';
import { estimateEfficiencyForCutoff, AIR } from '../lib/dieselCycle';
import type { RankineComparisonRow, RankineResult } from '../lib/rankineCycle';
import { fmtPercent } from '../lib/formatters';

interface AnalysisSectionProps {
  dieselInputs: DieselInputs;
  dieselRows: DieselComparisonRow[];
  rankineResult: RankineResult;
  rankineRows: RankineComparisonRow[];
}

export default function AnalysisSection({
  dieselInputs,
  dieselRows,
  rankineResult,
  rankineRows,
}: AnalysisSectionProps) {
  const d0 = dieselRows[0];
  const d1 = dieselRows[dieselRows.length - 1];
  const hasDiesel = dieselRows.length > 1;

  const etaLow = estimateEfficiencyForCutoff(dieselInputs, 1.4);
  const etaHigh = estimateEfficiencyForCutoff(dieselInputs, 2.6);
  const etaRef = estimateEfficiencyForCutoff(dieselInputs, dieselInputs.cutoffRatio);
  const cutLowDir = etaLow * 100 - etaRef * 100;
  const cutHighDir = etaHigh * 100 - etaRef * 100;

  const r0 = rankineRows[0];
  const r1 = rankineRows[rankineRows.length - 1];
  const flowFactor = r1.steamMassFlowKgS / r0.steamMassFlowKgS;
  const dTcwFactor = r1.dTcwC / r0.dTcwC;
  const pumpShare = (rankineResult.wpKJkg / rankineResult.wtKJkg) * 100;

  return (
    <section id="analysis" className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Engineering analysis"
          title="Engineering Analysis"
          lede="Interpretation of the calculated results, derived from the live values in the simulations above."
        />

        <div className="dash-grid">
          <section className="card analysis-card">
            <div className="card-head">
              <span className="card-head-icon" aria-hidden="true">
                <Gauge size={18} />
              </span>
              <h3 className="card-title">Diesel Cycle Analysis</h3>
            </div>

            {hasDiesel && (
              <>
                <div className="metricline">
                  <span className="metricline-label">Compression-ratio effect</span>
                  <span className="metricline-value">
                    η: {(d0.etaThermal * 100).toFixed(2)}% → {(d1.etaThermal * 100).toFixed(2)}%
                    <InfoChip label="Δ" value={`${(d1.etaThermal - d0.etaThermal >= 0 ? '+' : '')}${((d1.etaThermal - d0.etaThermal) * 100).toFixed(2)} pp`} />
                  </span>
                </div>
                <p>
                  Raising r from {d0.compressionRatio} to {d1.compressionRatio} raises the thermal
                  efficiency because T₂ climbs from {d0.t2C.toFixed(0)} °C to {d1.t2C.toFixed(0)} °C,
                  shifting the whole cycle to higher temperatures. The heat output — and with it the
                  fraction of heat rejected to the cold reservoir — grows more slowly than the heat
                  input, so w_net per kilogram climbs from {d0.wNetKJkg.toFixed(1)} to{' '}
                  {d1.wNetKJkg.toFixed(1)} kJ/kg.
                </p>

                <div className="metricline">
                  <span className="metricline-label">Cycle temperatures</span>
                  <span className="metricline-value">
                    T₂ {d0.t2C.toFixed(0)} → {d1.t2C.toFixed(0)} °C · T₃ {d0.t3C.toFixed(0)} →{' '}
                    {d1.t3C.toFixed(0)} °C
                  </span>
                </div>
                <p>
                  With constant k = {AIR.k}, T₂ = T₁·r^(k−1). Both the peak combustion temperature
                  T₃ = r_c·T₂ and the exhaust temperature T₄ follow directly; in the computed range T₄
                  changes far less than T₂ and T₃, so higher compression mostly improves the
                  high-temperature heat addition rather than the rejection.
                </p>

                <div className="metricline">
                  <span className="metricline-label">Power</span>
                  <span className="metricline-value">
                    {d0.powerKW.toFixed(1)} → {d1.powerKW.toFixed(1)} kW @ {dieselInputs.rpm} rpm
                  </span>
                </div>
                <p>
                  For the fixed 2.4 L, 4-cylinder two-stroke engine, power is the product of the
                  per-stroke work and the trapped air mass. The mass per cylinder falls only slightly
                  ({d0.massPerCycleKg.toFixed(4)} → {d1.massPerCycleKg.toFixed(4)} g) as r grows,
                  while the specific work rises more, so the computed power output increases with r.
                  Doubling the engine speed doubles the power for any fixed cycle.
                </p>

                <div className="metricline">
                  <span className="metricline-label">Cutoff-ratio significance</span>
                  <span className="metricline-value">
                    η at r_c = 1.4: {(etaLow * 100).toFixed(2)}% · at r_c ={' '}
                    {dieselInputs.cutoffRatio}: {(etaRef * 100).toFixed(2)}% · at r_c = 2.6:{' '}
                    {(etaHigh * 100).toFixed(2)}%
                  </span>
                </div>
                <p>
                  The cutoff ratio fixes how long heat is added at constant pressure. For a fixed
                  compression ratio the term (r_c^k − 1)/[k(r_c − 1)] in the Diesel-cycle efficiency
                  grows with r_c, so a smaller r_c gives a higher efficiency{' '}
                  {cutLowDir >= 0 ? '+' : ''}
                  {cutLowDir.toFixed(2)} pp at r_c = 1.4 while a larger r_c costs{' '}
                  {cutHighDir < 0 ? '' : '+'}
                  {cutHighDir.toFixed(2)} pp. The engine still makes more work per cycle with a larger
                  cutoff ratio because q_in rises, trading efficiency for specific power.
                </p>
              </>
            )}
          </section>

          <section className="card analysis-card">
            <div className="card-head">
              <span className="card-head-icon" aria-hidden="true">
                <Waves size={18} />
              </span>
              <h3 className="card-title">Rankine Cycle Analysis</h3>
            </div>

            {rankineResult.valid && rankineRows.length > 1 && (
              <>
                <div className="metricline">
                  <span className="metricline-label">Turbine / pump work split</span>
                  <span className="metricline-value">
                    w_t = {rankineResult.wtKJkg.toFixed(1)} kJ/kg · w_p ={' '}
                    {rankineResult.wpKJkg.toFixed(2)} kJ/kg
                  </span>
                </div>
                <p>
                  The turbine produces {rankineResult.wtKJkg.toFixed(1)} kJ/kg and the feed pump
                  consumes only {pumpShare.toFixed(2)}% of that ({rankineResult.wpKJkg.toFixed(2)}{' '}
                  kJ/kg), leaving {rankineResult.wNetKJkg.toFixed(1)} kJ/kg of net specific work.
                  Pump work is small because the liquid specific volume is tiny (vf ≈ 0.00101 m³/kg);
                  the pressure lift {rankineResult.states[2].P_kPa - rankineResult.states[1].P_kPa}{' '}
                  kPa is applied to an incompressible liquid.
                </p>

                <div className="metricline">
                  <span className="metricline-label">Thermal efficiency</span>
                  <span className="metricline-value">{fmtPercent(rankineResult.etaThermal)}</span>
                </div>
                <p>
                  Efficiency = w_net / q_in = {rankineResult.wNetKJkg.toFixed(1)} /{' '}
                  {rankineResult.qInKJkg.toFixed(1)} kJ/kg. The majority of the boiler heat
                  ({rankineResult.qOutKJkg.toFixed(1)} kJ/kg) is inevitably rejected in the
                  condenser — a fundamental feature of the ideal Rankine cycle at these temperature
                  limits.
                </p>

                <div className="metricline">
                  <span className="metricline-label">Steam-flow scaling</span>
                  <span className="metricline-value">
                    {r0.steamMassFlowKgS.toFixed(1)} → {r1.steamMassFlowKgS.toFixed(1)} kg/s
                    ({flowFactor.toFixed(1)}× for {r0.plantCapacityMW} → {r1.plantCapacityMW} MW)
                  </span>
                </div>
                <p>
                  ṁ_steam = Ẇ_plant / w_net: the net specific work does not depend on plant size, so
                  the steam flow is exactly proportional to capacity. Scaling 100 MW → 400 MW requires
                  {flowFactor.toFixed(1)}× the steam throughput at the same state points.
                </p>

                <div className="metricline">
                  <span className="metricline-label">Condenser &amp; cooling-water rise</span>
                  <span className="metricline-value">
                    Q̇_out {r0.heatRejectedMW.toFixed(0)} → {r1.heatRejectedMW.toFixed(0)} MW · ΔT_cw{' '}
                    {r0.dTcwC.toFixed(2)} → {r1.dTcwC.toFixed(2)} °C
                  </span>
                </div>
                <p>
                  Q̇_out = ṁ_steam · q_out rises with capacity, and with a fixed cooling-water flow of 1200
                  kg/s the temperature rise ΔT_cw = Q̇_out/(ṁ_cw·c_p,w) grows by the same factor (
                  {dTcwFactor.toFixed(1)}×). In practice the plant operator would increase the lake-water
                  pumping rate at higher loads to keep the condenser temperature (and back pressure)
                  controlled.
                </p>
              </>
            )}
          </section>
        </div>

        <div className="notice-banner info">
          <Activity size={18} aria-hidden="true" />
          <span>
            All figures above are computed live by the simulation engines ({' '}
            {assignment.appName} never uses hard-coded results). Change any input in the Diesel or
            Rankine simulations and the analysis text follows automatically.
          </span>
        </div>
      </div>
    </section>
  );
}