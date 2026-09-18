/**
 * Simple ideal Rankine cycle calculation engine (steam power plant).
 *
 * Every displayed result is computed by these functions. State definitions:
 *
 *   State 1 — condenser outlet, saturated liquid
 *   State 2 — pump outlet, compressed liquid
 *   State 3 — boiler outlet / turbine inlet, superheated vapour
 *   State 4 — turbine outlet, saturated mixture
 *
 * Unit conventions (all SI, kept consistent):
 *   pressure   : kPa
 *   temperature: °C
 *   energy     : kJ/kg (specific), kW (rate); 1 kPa·m³ = 1 kJ
 *   mass flow  : kg/s
 *
 *   Steam property values come from src/lib/steamProperties.ts (steam-table
 *   anchors at the assignment state points plus documented approximations).
 */

import { saturatedWaterProps, superheatedSteamProps } from './steamProperties';

export interface RankineInputs {
  plantCapacityMW: number;
  turbineInletPressureMPa: number;
  turbineInletTemperatureC: number;
  condenserPressureKPa: number;
  coolingWaterMassFlowKgS: number;
  coolingWaterCp: number;
}

export interface ValidationIssue {
  field: keyof RankineInputs | 'general';
  message: string;
}

export interface RankineStatePoint {
  state: number;
  name: string;
  phase: string;
  P_kPa: number;
  T_C: number | null;
  h_kJkg: number;
  s_kJkgK: number;
  x: number | null;
}

export interface RankineResult {
  valid: boolean;
  issues: ValidationIssue[];
  propertyNotes: string[];
  usesApproxCondenserProps: boolean;
  usesApproxTurbineInlet: boolean;
  tubeOutletSuperheated: boolean;
  states: RankineStatePoint[];
  tsatC: number;
  wpKJkg: number;
  wtKJkg: number;
  wNetKJkg: number;
  qInKJkg: number;
  qOutKJkg: number;
  etaThermal: number;
  steamMassFlowKgS: number;
  heatInputMW: number;
  heatRejectedMW: number;
  dTcwC: number;
  x4: number;
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  s3: number;
}

export function validateRankineInputs(inputs: RankineInputs): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const finite = (v: number) => Number.isFinite(v);

  if (!finite(inputs.plantCapacityMW) || inputs.plantCapacityMW <= 0) {
    issues.push({ field: 'plantCapacityMW', message: 'Plant capacity must be greater than 0 MW.' });
  }
  if (!finite(inputs.turbineInletPressureMPa) || inputs.turbineInletPressureMPa <= 0) {
    issues.push({ field: 'turbineInletPressureMPa', message: 'Turbine inlet pressure must be greater than 0 MPa.' });
  }
  if (!finite(inputs.turbineInletTemperatureC) || inputs.turbineInletTemperatureC + 273.15 <= 0) {
    issues.push({ field: 'turbineInletTemperatureC', message: 'Turbine inlet temperature must be above absolute zero.' });
  }
  if (!finite(inputs.condenserPressureKPa) || inputs.condenserPressureKPa <= 0) {
    issues.push({ field: 'condenserPressureKPa', message: 'Condenser pressure must be greater than 0 kPa.' });
  }
  if (!finite(inputs.coolingWaterMassFlowKgS) || inputs.coolingWaterMassFlowKgS <= 0) {
    issues.push({ field: 'coolingWaterMassFlowKgS', message: 'Cooling-water flow rate must be greater than 0 kg/s.' });
  }
  if (!finite(inputs.coolingWaterCp) || inputs.coolingWaterCp <= 0) {
    issues.push({ field: 'coolingWaterCp', message: 'Cooling-water specific heat must be greater than 0 kJ/kg·K.' });
  }
  if (
    finite(inputs.turbineInletPressureMPa) &&
    finite(inputs.condenserPressureKPa) &&
    inputs.turbineInletPressureMPa * 1000 <= inputs.condenserPressureKPa
  ) {
    issues.push({
      field: 'turbineInletPressureMPa',
      message: 'Turbine inlet pressure must be greater than the condenser pressure.',
    });
  }
  return issues;
}

export function calculateRankineCycle(inputs: RankineInputs): RankineResult {
  const zero = 0;
  const issues = validateRankineInputs(inputs);
  const valid = issues.length === 0;

  const p1 = inputs.condenserPressureKPa; // kPa
  const p2 = inputs.turbineInletPressureMPa * 1000; // MPa → kPa
  const sat = saturatedWaterProps(valid ? p1 : 10);
  const steam = superheatedSteamProps(valid ? inputs.turbineInletPressureMPa : 7, inputs.turbineInletTemperatureC);

  // State 1 — saturated liquid at condenser pressure.
  const h1 = sat.hf;
  const s1 = sat.sf;
  const v1 = sat.vf;

  // Pump: isentropic compression of incompressible liquid.
  // w_pump = v_f · ΔP ; kPa·m³/kg = kJ/kg.
  const wp = v1 * (p2 - p1);
  const h2 = h1 + wp;
  const s2 = s1;
  const t1 = sat.TsatC;
  const t2 = sat.TsatC + wp / 4.18;

  // State 3 — boiler outlet / turbine inlet.
  const h3 = steam.h;
  const s3 = steam.s;
  const t3 = inputs.turbineInletTemperatureC;

  // State 4 — isentropic turbine expansion to condenser pressure.
  const x4 = (s3 - sat.sf) / sat.sfg;
  const h4 = sat.hf + x4 * sat.hfg;
  const t4 = sat.TsatC;

  const wt = h3 - h4;
  const wNet = wt - wp;
  const qIn = h3 - h2;
  const qOut = h4 - h1;
  const eta = valid && qIn > 0 ? wNet / qIn : zero;

  // Plant net output Ẇ_plant = ṁ_steam · w_net  ⇒  MW → kW for consistent units.
  const steamMassFlow = valid ? (inputs.plantCapacityMW * 1000) / wNet : zero;
  const heatRejectedKW = steamMassFlow * qOut;
  // Q̇_out = ṁ_cw · c_p,w · ΔT_cw  ⇒  ΔT_cw = Q̇_out / (ṁ_cw · c_p,w).
  const dTcw = valid && inputs.coolingWaterMassFlowKgS > 0 && inputs.coolingWaterCp > 0
    ? heatRejectedKW / (inputs.coolingWaterMassFlowKgS * inputs.coolingWaterCp)
    : zero;

  return {
    valid,
    issues,
    propertyNotes: [
      'Steam properties are based on standard steam-table values for the specified assignment state points.',
    ],
    usesApproxCondenserProps: valid && !sat.exactSteamTable,
    usesApproxTurbineInlet: valid && !steam.atReference,
    tubeOutletSuperheated: x4 > 1,
    states: [
      {
        state: 1,
        name: 'Condenser outlet',
        phase: 'Saturated liquid',
        P_kPa: p1,
        T_C: t1,
        h_kJkg: h1,
        s_kJkgK: s1,
        x: 0,
      },
      {
        state: 2,
        name: 'Pump outlet',
        phase: 'Compressed liquid',
        P_kPa: p2,
        T_C: t2,
        h_kJkg: h2,
        s_kJkgK: s2,
        x: null,
      },
      {
        state: 3,
        name: 'Boiler outlet / turbine inlet',
        phase: 'Superheated vapour',
        P_kPa: p2,
        T_C: t3,
        h_kJkg: h3,
        s_kJkgK: s3,
        x: null,
      },
      {
        state: 4,
        name: 'Turbine outlet',
        phase: x4 > 1 ? 'Superheated vapour' : 'Saturated mixture',
        P_kPa: p1,
        T_C: t4,
        h_kJkg: h4,
        s_kJkgK: s3,
        x: x4 > 1 ? null : x4,
      },
    ],
    tsatC: sat.TsatC,
    wpKJkg: wp,
    wtKJkg: wt,
    wNetKJkg: wNet,
    qInKJkg: qIn,
    qOutKJkg: qOut,
    etaThermal: eta,
    steamMassFlowKgS: steamMassFlow,
    heatInputMW: (steamMassFlow * qIn) / 1000,
    heatRejectedMW: heatRejectedKW / 1000,
    dTcwC: dTcw,
    x4,
    h1,
    h2,
    h3,
    h4,
    s3,
  };
}

export interface RankineComparisonRow {
  plantCapacityMW: number;
  etaThermal: number;
  steamMassFlowKgS: number;
  heatRejectedMW: number;
  heatInputMW: number;
  dTcwC: number;
  qOutKJkg: number;
}

/**
 * Runs the cycle for a list of plant capacities (the assignment scenarios
 * 100, 200, 300, 400 MW). Steam flow and condenser rejection scale with
 * capacity; the per-kg cycle performance is identical for every row.
 */
export function calculateRankineComparison(
  inputs: RankineInputs,
  capacitiesMW: number[],
): RankineComparisonRow[] {
  const base = calculateRankineCycle(inputs);
  return capacitiesMW.map((mw) => {
    const res = calculateRankineCycle({ ...inputs, plantCapacityMW: mw });
    return {
      plantCapacityMW: mw,
      etaThermal: res.etaThermal,
      steamMassFlowKgS: res.steamMassFlowKgS,
      heatRejectedMW: res.heatRejectedMW,
      heatInputMW: res.heatInputMW,
      dTcwC: res.dTcwC,
      qOutKJkg: base.qOutKJkg,
    };
  });
}

export interface CommentaryBlock {
  title: string;
  body: string;
}

/** Data-driven engineering interpretation of the calculated Rankine cycle. */
export function buildRankineCommentary(result: RankineResult, rows: RankineComparisonRow[]): CommentaryBlock[] {
  const blocks: CommentaryBlock[] = [];

  if (rows.length < 2) return blocks;

  const first = rows[0];
  const last = rows[rows.length - 1];
  const flowRatio = last.steamMassFlowKgS / first.steamMassFlowKgS;
  const dTcwRatio = last.dTcwC / first.dTcwC;
  const pumpShare = (result.wpKJkg / result.wtKJkg) * 100;

  blocks.push({
    title: 'Turbine, pump and net specific work',
    body:
      `The turbine develops ${result.wtKJkg.toFixed(2)} kJ/kg of specific work while the isentropic pump ` +
      `absorbs only ${result.wpKJkg.toFixed(2)} kJ/kg (${pumpShare.toFixed(2)} % of the turbine work), leaving ` +
      `a net specific work output of ${result.wNetKJkg.toFixed(2)} kJ/kg. The pump-work term is small because ` +
      `the liquid specific volume is tiny, so w_net ≈ w_turbine for an ideal Rankine cycle.`,
  });

  blocks.push({
    title: 'Thermal efficiency',
    body:
      `The cycle converts ${result.qInKJkg.toFixed(1)} kJ/kg of boiler heat (h₃ − h₂) of which ` +
      `${result.wNetKJkg.toFixed(2)} kJ/kg appears as net work, giving a thermal efficiency of ` +
      `${(result.etaThermal * 100).toFixed(2)} %. The balance (${result.qOutKJkg.toFixed(1)} kJ/kg, ` +
      `h₄ − h₁) is rejected to the condenser.`,
  });

  blocks.push({
    title: 'Steam flow scaling',
    body:
      `Because w_net is fixed per kilogram of steam, the required steam flow scales linearly with plant ` +
      `capacity: ṁ_steam = Ẇ_plant / w_net. Rising from ${first.plantCapacityMW} MW to ` +
      `${last.plantCapacityMW} MW raises the steam flow from ${first.steamMassFlowKgS.toFixed(2)} kg/s to ` +
      `${last.steamMassFlowKgS.toFixed(2)} kg/s — a factor of ${flowRatio.toFixed(2)} (${last.plantCapacityMW} / ` +
      `${first.plantCapacityMW} MW).`,
  });

  blocks.push({
    title: 'Condenser heat rejection and cooling-water temperature rise',
    body:
      `The condenser rejects Q̇_out = ṁ_steam · q_out, which scales with capacity for a fixed cycle ` +
      `(${first.heatRejectedMW.toFixed(1)} MW at ${first.plantCapacityMW} MW plant to ` +
      `${last.heatRejectedMW.toFixed(1)} MW at ${last.plantCapacityMW} MW plant). With the cooling-water ` +
      `flow held at 1200 kg/s, the lake-water temperature rise grows in proportion: ` +
      `${first.dTcwC.toFixed(2)} °C at ${first.plantCapacityMW} MW and ${last.dTcwC.toFixed(2)} °C at ` +
      `${last.plantCapacityMW} MW (factor ${dTcwRatio.toFixed(2)}). In a real plant the cooling flow would be ` +
      `increased at higher loads to protect the condenser performance and the lake ecosystem.`,
  });

  return blocks;
}