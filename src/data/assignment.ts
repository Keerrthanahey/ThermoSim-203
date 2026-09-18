/** Canonical assignment data for BAMEE203 Assignment II, Set C. */

export const assignment = {
  appName: 'ThermoSim 203',
  subtitle: 'Thermodynamics & Thermal Systems Simulator',
  course: 'BAMEE203',
  courseName: 'Thermodynamics and Thermal Systems',
  assignment: 'Assignment II',
  set: 'Set C',
  studentId: '25BME1122',
  studentName: 'N T KEERRTHANA',

  diesel: {
    title: 'Problem 1 — Ideal Diesel Cycle',
    problemStatement:
      'A four-cylinder two-stroke 2.4-L diesel engine that operates on an ideal Diesel cycle has a compression ratio of 17 and a cutoff ratio of 2.2. Air is at 55 °C and 97 kPa at the beginning of the compression process. Using the cold-air-standard assumptions, determine how much power the engine will deliver at 2400 rpm. Analyse the scenarios if the compression ratio is 19, 21, 23.',
    totalDisplacementL: 2.4,
    cylinders: 4,
    cycle: '2-stroke',
    rpm: 2400,
    initialTemperatureC: 55,
    initialPressureKPa: 97,
    compressionRatio: 17,
    cutoffRatio: 2.2,
    compressionRatios: [17, 19, 21, 23],
  },

  rankine: {
    title: 'Problem 2 — Simple Ideal Rankine Cycle',
    problemStatement:
      'Consider a steam power plant that operates on a simple ideal Rankine cycle and has a net power output of 100 MW. Steam enters the turbine at 7 MPa and 500 °C and is cooled in the condenser at a pressure of 10 kPa by running cooling water from a lake through the tubes of the condenser at a rate of 1200 kg/s. Determine: (a) thermal efficiency, (b) mass flow rate of steam, (c) temperature rise of cooling water. Determine the same conditions for plant capacities of 200 MW, 300 MW and 400 MW.',
    plantCapacityMW: 100,
    turbineInletPressureMPa: 7,
    turbineInletTemperatureC: 500,
    condenserPressureKPa: 10,
    coolingWaterMassFlowKgS: 1200,
    coolingWaterCp: 4.18,
    plantCapacitiesMW: [100, 200, 300, 400],
  },
} as const;

export const DIESEL_ASSUMPTIONS = [
  'Cold-air-standard cycle',
  'Air behaves as an ideal gas',
  'Constant specific heats (k = 1.4, cp = 1.005, cv = 0.718 kJ/kg·K)',
  'Reversible adiabatic (isentropic) compression, 1 → 2',
  'Constant-pressure heat addition, 2 → 3',
  'Reversible adiabatic (isentropic) expansion, 3 → 4',
  'Constant-volume heat rejection, 4 → 1',
  'No friction losses',
  'No heat loss to the surroundings',
  'No pumping losses',
  'Ideal volumetric filling of the cylinders',
] as const;

export const RANKINE_ASSUMPTIONS = [
  'Steady-flow ideal Rankine cycle',
  'Isentropic (reversible adiabatic) pump',
  'Isentropic (reversible adiabatic) turbine',
  'Constant-pressure heat addition in the boiler',
  'Constant-pressure heat rejection in the condenser',
  'Negligible kinetic and potential energy changes across components',
  'Saturated liquid leaves the condenser (state 1)',
  'Standard steam-table properties at the assignment state points',
  'Fixed cooling-water flow rate of 1200 kg/s',
  'Constant cooling-water specific heat, 4.18 kJ/kg·K',
] as const;