/**
 * Cold-air-standard Diesel cycle calculation engine.
 *
 * Independent of the UI — every displayed numerical result is produced by the
 * functions below using the actual ideal-cycle equations.
 *
 * Units used internally:
 *   pressure  : kPa
 *   volume    : m³  (input displacement is converted from litres)
 *   mass      : kg
 *   temperature: K (input is converted from °C)
 *   energy    : kJ  (kJ/kg for specific quantities => kW for power rates)
 *
 * Conventions:
 *   1 → 2  isentropic compression
 *   2 → 3  constant-pressure heat addition
 *   3 → 4  isentropic expansion
 *   4 → 1  constant-volume heat rejection
 */

export const AIR = {
  k: 1.4, // specific heat ratio (cold air standard)
  R: 0.287, // kJ/(kg·K)
  cp: 1.005, // kJ/(kg·K)
  cv: 0.718, // kJ/(kg·K)
} as const;

export type CycleType = '2-stroke' | '4-stroke';

export interface DieselInputs {
  totalDisplacementL: number;
  cylinders: number;
  rpm: number;
  initialTemperatureC: number;
  initialPressureKPa: number;
  compressionRatio: number;
  cutoffRatio: number;
  cycleType: CycleType;
}

export interface ValidationIssue {
  field: keyof DieselInputs | 'general';
  message: string;
}

export interface DieselResult {
  valid: boolean;
  issues: ValidationIssue[];
  /** Total swept volume of all cylinders, m³. */
  totalSweptVolumeM3: number;
  /** Swept volume of a single cylinder, m³. */
  perCylinderSweptVolumeM3: number;
  /** Clearance volume V₂, m³. */
  clearanceVolumeM3: number;
  /** Maximum cylinder volume V₁, m³. */
  maxVolumeM3: number;
  /** Volume at end of heat addition V₃, m³. */
  cutoffVolumeM3: number;
  /** Trapped air mass per cylinder per cycle, kg. */
  massPerCycleKg: number;
  /** Specific volume at state 1, m³/kg. */
  specificVolume1M3kg: number;
  /** Number of power-strokes per second across all cylinders. */
  powerStrokesPerSecond: number;
  t1K: number;
  t2K: number;
  t3K: number;
  t4K: number;
  t1C: number;
  t2C: number;
  t3C: number;
  t4C: number;
  p1KPa: number;
  p2KPa: number;
  p3KPa: number;
  p4KPa: number;
  /** kJ/kg */
  qInKJkg: number;
  /** kJ/kg */
  qOutKJkg: number;
  /** kJ/kg */
  wNetKJkg: number;
  /** Thermal efficiency, 0..1. */
  etaThermal: number;
  /** kJ per power stroke in one cylinder. */
  workPerCycleKJ: number;
  /** Rate of heat addition across the engine, kW. */
  heatInputRateKw: number;
  /** Rate of heat rejection across the engine, kW. */
  heatRejectionRateKw: number;
  powerKW: number;
  powerMW: number;
}

export function validateDieselInputs(inputs: DieselInputs): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const finite = (v: number) => Number.isFinite(v);

  if (!finite(inputs.totalDisplacementL) || inputs.totalDisplacementL <= 0) {
    issues.push({ field: 'totalDisplacementL', message: 'Total displacement must be greater than 0 L.' });
  }
  if (
    !finite(inputs.cylinders) ||
    inputs.cylinders < 1 ||
    !Number.isInteger(inputs.cylinders)
  ) {
    issues.push({ field: 'cylinders', message: 'Number of cylinders must be a whole number ≥ 1.' });
  }
  if (!finite(inputs.rpm) || inputs.rpm <= 0) {
    issues.push({ field: 'rpm', message: 'Engine speed must be greater than 0 rpm.' });
  }
  if (!finite(inputs.initialTemperatureC) || inputs.initialTemperatureC + 273.15 <= 0) {
    issues.push({ field: 'initialTemperatureC', message: 'Initial temperature must be above absolute zero.' });
  }
  if (!finite(inputs.initialPressureKPa) || inputs.initialPressureKPa <= 0) {
    issues.push({ field: 'initialPressureKPa', message: 'Initial pressure must be greater than 0 kPa.' });
  }
  if (!finite(inputs.compressionRatio) || inputs.compressionRatio <= 1) {
    issues.push({ field: 'compressionRatio', message: 'Compression ratio must be greater than 1.' });
  }
  if (!finite(inputs.cutoffRatio) || inputs.cutoffRatio <= 1) {
    issues.push({ field: 'cutoffRatio', message: 'Cutoff ratio must be greater than 1.' });
  }
  if (
    finite(inputs.compressionRatio) &&
    finite(inputs.cutoffRatio) &&
    inputs.cutoffRatio >= inputs.compressionRatio
  ) {
    issues.push({
      field: 'cutoffRatio',
      message: 'Cutoff ratio must be less than the compression ratio.',
    });
  }
  return issues;
}

export function calculateDieselCycle(inputs: DieselInputs): DieselResult {
  const zero = 0;
  const issues = validateDieselInputs(inputs);
  const valid = issues.length === 0;

  const t1K = inputs.initialTemperatureC + 273.15;
  const vdTotal = inputs.totalDisplacementL / 1000; // L → m³
  const vd = vdTotal / Math.max(inputs.cylinders, 1);
  const v2 = vd / (Math.max(inputs.compressionRatio, 1) - 1);
  const v1 = v2 * Math.max(inputs.compressionRatio, 1);
  const v3 = v2 * Math.max(inputs.cutoffRatio, 1);

  // m = P₁V₁ / (RT₁). P (kPa) × V (m³) = kJ; R (kJ/kg·K) × T (K) = kJ/kg → kg.
  const mass = valid ? (inputs.initialPressureKPa * v1) / (AIR.R * t1K) : zero;

  const t2K = t1K * Math.pow(Math.max(inputs.compressionRatio, 1), AIR.k - 1);
  const t3K = t2K * Math.max(inputs.cutoffRatio, 1);
  const t4K = t3K * Math.pow(Math.max(inputs.cutoffRatio, 1) / Math.max(inputs.compressionRatio, 1), AIR.k - 1);

  const qIn = AIR.cp * (t3K - t2K);
  const qOut = AIR.cv * (t4K - t1K);
  const wNet = qIn - qOut;
  const eta = valid && qIn > 0 ? wNet / qIn : zero;

  const p1 = inputs.initialPressureKPa;
  const p2 = p1 * Math.pow(Math.max(inputs.compressionRatio, 1), AIR.k);
  const p3 = p2;
  const p4 = p3 * Math.pow(Math.max(inputs.cutoffRatio, 1) / Math.max(inputs.compressionRatio, 1), AIR.k);

  // A 2-stroke engine fires once per revolution; a 4-stroke engine once per two revolutions.
  const strokesPerRev = inputs.cycleType === '2-stroke' ? 1 : 0.5;
  const powerStrokesPerSecond = valid
    ? Math.max(inputs.cylinders, 1) * (Math.max(inputs.rpm, 0) / 60) * strokesPerRev
    : zero;

  const workPerCycle = wNet * mass; // kJ
  const powerKW = workPerCycle * powerStrokesPerSecond; // kJ/s = kW
  const powerMW = powerKW / 1000;

  return {
    valid,
    issues,
    totalSweptVolumeM3: vdTotal,
    perCylinderSweptVolumeM3: vd,
    clearanceVolumeM3: v2,
    maxVolumeM3: v1,
    cutoffVolumeM3: v3,
    massPerCycleKg: mass,
    specificVolume1M3kg: valid && mass > 0 ? v1 / mass : zero,
    powerStrokesPerSecond,
    t1K,
    t2K,
    t3K,
    t4K,
    t1C: t1K - 273.15,
    t2C: t2K - 273.15,
    t3C: t3K - 273.15,
    t4C: t4K - 273.15,
    p1KPa: p1,
    p2KPa: p2,
    p3KPa: p3,
    p4KPa: p4,
    qInKJkg: qIn,
    qOutKJkg: qOut,
    wNetKJkg: wNet,
    etaThermal: eta,
    workPerCycleKJ: workPerCycle,
    heatInputRateKw: qIn * mass * powerStrokesPerSecond,
    heatRejectionRateKw: qOut * mass * powerStrokesPerSecond,
    powerKW,
    powerMW,
  };
}

export interface DieselComparisonRow {
  compressionRatio: number;
  t1C: number;
  t2C: number;
  t3C: number;
  t4C: number;
  qInKJkg: number;
  qOutKJkg: number;
  wNetKJkg: number;
  etaThermal: number;
  powerKW: number;
  powerMW: number;
  massPerCycleKg: number;
  workPerCycleKJ: number;
}

/**
 * Runs the cycle for a list of compression ratios (the assignment scenarios
 * r = 17, 19, 21, 23) and returns one row per ratio, all computed live.
 */
export function calculateDieselComparison(
  inputs: DieselInputs,
  compressionRatios: number[],
): DieselComparisonRow[] {
  return compressionRatios.map((r) => {
    const res = calculateDieselCycle({ ...inputs, compressionRatio: r });
    return {
      compressionRatio: r,
      t1C: res.t1C,
      t2C: res.t2C,
      t3C: res.t3C,
      t4C: res.t4C,
      qInKJkg: res.qInKJkg,
      qOutKJkg: res.qOutKJkg,
      wNetKJkg: res.wNetKJkg,
      etaThermal: res.etaThermal,
      powerKW: res.powerKW,
      powerMW: res.powerMW,
      massPerCycleKg: res.massPerCycleKg,
      workPerCycleKJ: res.workPerCycleKJ,
    };
  });
}

export interface CommentaryBlock {
  title: string;
  body: string;
}

/**
 * Builds the engineering commentary from the actually-calculated scenario
 * results. The wording (e.g. "rises"/"falls") is derived from the numbers,
 * never hard-coded.
 */
export function buildDieselCommentary(
  rows: DieselComparisonRow[],
  inputs: DieselInputs,
): CommentaryBlock[] {
  if (rows.length < 2) return [];
  const first = rows[0];
  const last = rows[rows.length - 1];

  const dEtaPct = (last.etaThermal - first.etaThermal) * 100;
  const dPowerKw = last.powerKW - first.powerKW;
  const dWnet = last.wNetKJkg - first.wNetKJkg;
  const dT2 = last.t2C - first.t2C;
  const dT3 = last.t3C - first.t3C;
  const dT4 = last.t4C - first.t4C;
  const dMass = last.massPerCycleKg - first.massPerCycleKg;
  const strokesPerSec =
    inputs.cylinders * (inputs.rpm / 60) * (inputs.cycleType === '2-stroke' ? 1 : 0.5);
  const qInDir = last.qInKJkg - first.qInKJkg;
  const qOutDir = last.qOutKJkg - first.qOutKJkg;

  const etaDirWord = dEtaPct > 1e-9 ? 'increases' : dEtaPct < -1e-9 ? 'decreases' : 'stays essentially constant';
  const powDirWord = dPowerKw > 1e-9 ? 'increases' : dPowerKw < -1e-9 ? 'decreases' : 'stays essentially constant';
  const wnetDirWord = dWnet > 1e-9 ? 'rises' : dWnet < -1e-9 ? 'falls' : 'stays essentially constant';

  return [
    {
      title: 'Compression ratio and thermal efficiency',
      body:
        `As the compression ratio is raised from ${first.compressionRatio} to ${last.compressionRatio}, ` +
        `the ideal-cycle thermal efficiency ${etaDirWord} by ${Math.abs(dEtaPct).toFixed(2)} percentage points ` +
        `(from ${(first.etaThermal * 100).toFixed(2)} % at r = ${first.compressionRatio} to ` +
        `${(last.etaThermal * 100).toFixed(2)} % at r = ${last.compressionRatio}). ` +
        `In a cold-air-standard Diesel cycle a higher compression ratio produces a larger temperature ` +
        `rise during the isentropic compression stroke, so a greater fraction of the constant-pressure ` +
        `heat input is converted into net work over the cycle.`,
    },
    {
      title: 'Cycle temperatures',
      body:
        `The state temperatures are driven directly by the compression and cutoff ratios. ` +
        `Across the scenario range, T₂ ${dT2 >= 0 ? 'rises from' : 'falls from'} ${first.t2C.toFixed(1)} °C to ` +
        `${last.t2C.toFixed(1)} °C, so the heat-addition temperature level T₃ likewise ` +
        `${dT3 >= 0 ? 'rises from' : 'falls from'} ${first.t3C.toFixed(1)} °C to ${last.t3C.toFixed(1)} °C. ` +
        `The exhaust temperature T₄ ${dT4 >= 0 ? 'increases from' : 'falls from'} ${first.t4C.toFixed(1)} °C to ` +
        `${last.t4C.toFixed(1)} °C — a much smaller change than T₂ and T₃, which reflects how the heat ` +
        `rejection line remains close to the compression temperature level.`,
    },
    {
      title: 'Specific work',
      body:
        `The net specific work ${wnetDirWord} from ${first.wNetKJkg.toFixed(2)} kJ/kg to ` +
        `${last.wNetKJkg.toFixed(2)} kJ/kg over the range. This happens because the heat added ` +
        `${qInDir >= 0 ? 'grows from' : 'falls from'} ${first.qInKJkg.toFixed(1)} to ${last.qInKJkg.toFixed(1)} kJ/kg ` +
        `while the heat rejected ${qOutDir >= 0 ? 'grows less quickly' : 'shrinks'}` +
        ` (${first.qOutKJkg.toFixed(1)} → ${last.qOutKJkg.toFixed(1)} kJ/kg). ` +
        `The widening gap between heat in and heat out is what produces the efficiency gain.`,
    },
    {
      title: 'Calculated engine power',
      body:
        `The engine power ${powDirWord} from ${first.powerKW.toFixed(2)} kW at r = ${first.compressionRatio} to ` +
        `${last.powerKW.toFixed(2)} kW at r = ${last.compressionRatio} with the cycle run at ` +
        `${inputs.rpm} rpm (${inputs.cylinders}-cylinder ${inputs.cycleType} engine). Power is the product ` +
        `of the per-power-stroke work (${first.workPerCycleKJ.toFixed(4)} → ${last.workPerCycleKJ.toFixed(4)} kJ) ` +
        `and the number of power strokes per second (${strokesPerSec.toFixed(1)} for a ${inputs.cycleType} engine). ` +
        `The trapped air mass per cylinder ${dMass >= 0 ? 'increases' : 'decreases'} slightly from ` +
        `${(first.massPerCycleKg * 1e6).toFixed(2)} × 10⁻⁶ kg to ${(last.massPerCycleKg * 1e6).toFixed(2)} × 10⁻⁶ kg ` +
        `because the swept volume is fixed and V₁ = r·V₂ shifts with r.`,
    },
    {
      title: 'Efficiency and power together',
      body:
        `In this operating range the rising thermal efficiency and the rising specific work combine so that ` +
        `the engine power ${powDirWord} across the scenarios. Note that the power also scales linearly with ` +
        `engine speed (${inputs.rpm} rpm here) and with the trapped air mass, so changing the speed or the ` +
        `displacement rescales the results without changing the per-kg cycle performance.`,
    },
  ];
}

/** Estimates efficiency for alternative cutoff ratios (used in the analysis section). */
export function estimateEfficiencyForCutoff(inputs: DieselInputs, cutoffRatio: number): number {
  const res = calculateDieselCycle({ ...inputs, cutoffRatio });
  return res.etaThermal;
}