/**
 * Steam property model for the assignment state points.
 *
 * The ideal Rankine cycle of Assignment II is anchored to standard steam-table
 * values at its two fixed state points:
 *
 *   Turbine inlet  (7 MPa, 500 °C):  h₃ = 3411.4 kJ/kg,  s₃ = 6.8000 kJ/kg·K
 *   Condenser      (10 kPa):         h_f = 191.81, h_fg = 2392.82 kJ/kg
 *                                    s_f = 0.6492, s_fg = 7.4996 kJ/kg·K
 *                                    v_f = 0.001010 m³/kg, T_sat = 45.83 °C
 *
 * If the user changes the turbine-inlet or condenser inputs away from these
 * assignment values, the module uses two clearly documented approximations that
 * are anchored to the steam-table reference values:
 *
 *   1. superheatedSteamProps() — a first-order (ideal-gas like) expansion from
 *      the reference point for enthalpy, entropy and specific volume.
 *   2. saturatedWaterProps()   — an Antoine saturation-temperature fit with a
 *      Watson correction for the enthalpy of vaporisation, plus a constant
 *      liquid specific heat for saturated-liquid values.
 *
 * This module is intentionally NOT a general-purpose steam-property solver.
 */

export const STEAM_MODEL_DOC = {
  base: 'Steam properties are based on standard steam-table values for the specified assignment state points.',
  turbineInlet: 'Turbine inlet (7 MPa, 500 °C): h = 3411.4 kJ/kg, s = 6.8000 kJ/kg·K (superheated steam table).',
  condenser:
    'Condenser (10 kPa): hf = 191.81 kJ/kg, hfg = 2392.82 kJ/kg, sf = 0.6492 kJ/kg·K, sfg = 7.4996 kJ/kg·K, vf = 0.001010 m³/kg, Tsat = 45.83 °C.',
  approximation:
    'Moving the turbine-inlet or condenser inputs off the assignment values switches the module to a documented first-order / saturation-correlation approximation anchored to the steam-table values above. It is not a general-purpose steam-property solver.',
} as const;

/** Saturated water and steam at 10 kPa — standard steam-table values (Table A-5). */
export const SATURATED_WATER_10KPA = {
  pressureKPa: 10,
  TsatC: 45.83,
  hf: 191.81,
  hfg: 2392.82,
  hg: 2584.63,
  sf: 0.6492,
  sfg: 7.4996,
  sg: 8.1488,
  vf: 0.00101,
} as const;

/** Superheated steam at the turbine-inlet reference (Table A-6). */
export const STEAM_TURBINE_INLET_REF = {
  pMPa: 7,
  tC: 500,
  h: 3411.4,
  s: 6.8,
  v: 0.0527,
} as const;

export interface SaturatedWaterProps {
  pressureKPa: number;
  TsatC: number;
  hf: number;
  hfg: number;
  hg: number;
  sf: number;
  sfg: number;
  sg: number;
  vf: number;
  exactSteamTable: boolean;
}

/**
 * Saturated water/steam properties at the requested condenser pressure.
 * Returns the exact steam-table set at 10 kPa; for other pressures uses the
 * documented approximations.
 */
export function saturatedWaterProps(pressureKPa: number): SaturatedWaterProps {
  if (Math.abs(pressureKPa - SATURATED_WATER_10KPA.pressureKPa) < 1e-9) {
    return { ...SATURATED_WATER_10KPA, exactSteamTable: true };
  }

  // Antoine equation for water, 0–100 °C. P in mmHg, T in °C.
  // log10(P_mmHg) = 8.07131 − 1730.63 / (T + 233.426)
  const pMMHg = pressureKPa / 0.133322;
  const tsatC = 1730.63 / (8.07131 - Math.log10(pMMHg)) - 233.426;
  const tK = tsatC + 273.15;

  // Watson equation: hfg scales with reduced temperature from the 10 kPa reference.
  const tcK = 647.14;
  const tr = (tcK - tK) / (tcK - 318.98);
  const hfg = SATURATED_WATER_10KPA.hfg * Math.pow(tr, 0.38);

  // Saturated liquid referenced to the triple point (0.01 °C, h = 0, s = 0).
  const hf = 4.18 * (tsatC - 0.01);
  const sf = 4.18 * Math.log(tK / 273.16);
  const sfg = hfg / tK;

  return {
    pressureKPa,
    TsatC: tsatC,
    hf,
    hfg,
    hg: hf + hfg,
    sf,
    sfg,
    sg: sf + sfg,
    vf: 0.001,
    exactSteamTable: false,
  };
}

export interface SuperheatedSteamProps {
  pMPa: number;
  tC: number;
  h: number;
  s: number;
  v: number;
  atReference: boolean;
}

/**
 * Superheated-steam properties at the turbine inlet. Exact steam-table values
 * at the reference point; a documented first-order expansion elsewhere.
 */
export function superheatedSteamProps(pMPa: number, tC: number): SuperheatedSteamProps {
  const ref = STEAM_TURBINE_INLET_REF;
  const cpSteam = 2.1; // kJ/kg·K, ~ constant specific heat of superheated steam near the reference
  const rSteam = 0.4615; // kJ/kg·K, individual gas constant of water vapour
  const tK = tC + 273.15;
  const tRefK = ref.tC + 273.15;

  const atReference = pMPa === ref.pMPa && tC === ref.tC;
  const h = ref.h + cpSteam * (tK - tRefK);
  const s = ref.s + cpSteam * Math.log(tK / tRefK) - rSteam * Math.log(pMPa / ref.pMPa);
  const v = ref.v * (tK / tRefK) * (ref.pMPa / pMPa);

  return { pMPa, tC, h, s, v, atReference };
}

/** Constant-pressure liquid water specific heat used for the cooling water, kJ/kg·K. */
export const WATER_CP_LIQUID = 4.18;