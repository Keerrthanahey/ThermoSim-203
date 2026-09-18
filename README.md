# ThermoSim 203 — Thermodynamics & Thermal Systems Simulator

An interactive single-page web application that solves the two cycles assigned in
**BAMEE203 · Thermodynamics and Thermal Systems · Assignment II (Set C)** and lets you
explore how changing the design parameters affects performance — with live results,
comparison tables, charts and drawn cycle diagrams.

**Student ID:** 25BME1122 · **Student:** N T KEERRTHANA

---

## Features

- **Problem 1 — Ideal Diesel cycle** (four-cylinder, 2.4 L, two-stroke, 2400 rpm):
  live computation of the four state points, heat added/rejected, net work,
  thermal efficiency and brake power. Adjust compression ratio, cutoff ratio,
  rpm, displacement, cylinders and stroke type, or reset to the assignment values.
- **Scenario analysis**: efficiency, power, net work and state temperatures are
  compared against the compression-ratio sweep r = 17, 19, 21, 23 as required.
- **Problem 2 — Simple ideal Rankine cycle** (100 MW, 7 MPa / 500 °C, 10 kPa,
  1200 kg/s cooling water): live computation of thermal efficiency, steam mass
  flow, cooling-water temperature rise, specific works, condenser duty and
  turbine-exhaust quality.
- **Capacity sweep**: steam flow, ΔT_cw, efficiency and state enthalpies are
  compared for 100 / 200 / 300 / 400 MW as required.
- **An interpretation section** explaining why efficiency is invariant to plant
  capacity, why steam flow and ΔT_cw scale linearly, and the Diesel efficiency
  trend with compression ratio.
- **Derived-equation reference** for both cycles (22 equations), state tables at
  each phase, and full assumptions panels.
- **Drawn-cycle diagrams**: logical P–v diagram for the Diesel cycle and a
  schematic T–s diagram for the Rankine cycle (custom SVG, not images).
- Fully responsive (desktop / tablet / mobile), accessible, and offline-capable
  once built to `dist/`.

## Technology

- **React 18** + **TypeScript 5.6** + **Vite 5.4**
- **Recharts 2** for the charts, **lucide-react** for icons
- IBM Plex fonts, custom SVG diagrams, hand-written CSS design system
- Static build with relative asset paths — deployable to any static host

## Getting started

Requires Node.js ≥ 18 (tested with Node 24 / npm 11).

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build -> dist/
npm run preview    # serve the production build (http://localhost:4173)
npm run lint       # TypeScript type-check only
```

## Project structure

```
src/
  main.tsx / App.tsx          App shell and section assembly
  index.css                   Design system + responsive layout
  data/assignment.ts          Assignment statements, defaults, assumptions
  lib/
    dieselCycle.ts            Diesel cycle engine + scenario comparison
    rankineCycle.ts           Rankine cycle engine + scenario comparison
    steamProperties.ts        Steam-table values and property model
    formatters.ts             Number/unit formatting helpers
  components/
    DieselSection.tsx         Interactive Diesel calculator
    RankineSection.tsx        Interactive Rankine calculator
    AnalysisSection.tsx       Result interpretation
    EquationsSection.tsx      Derived equations + assumptions
    DieselPVChart.tsx         Logial P–v diagram (SVG)
    RankineTSChart.tsx        Schematic T–s diagram (SVG)
    DieselCharts.tsx          Efficiency/power/temperature vs r charts
    RankineCharts.tsx         Flow / ΔT / efficiency charts
    FieldInputs.tsx           Number + select inputs
    StatCard, ResultCard, InputCard, ComparisonTable, StateTable,
    EquationCard, AssumptionsCard, ChartFrame, chartTheme ...
```

## Diesel cycle methodology

Cold-air-standard analysis (constant specific heats, k = 1.4, cₚ = 1.005,
cᵥ = 0.718 kJ/kg·K):

- State 1 → 2: isentropic compression — T₂ = T₁·r^{k−1}
- State 2 → 3: constant-pressure heat addition — T₃ = T₂·r_c
- State 3 → 4: isentropic expansion — T₄ = T₃·(r_c / r)^{k−1}
- q_in = cₚ(T₃ − T₂), q_out = cᵥ(T₄ − T₁), w_net = q_in − q_out
- η = 1 − (1 / r^{k−1})·(r_c^k − 1) / (k(r_c − 1))
- Air mass per cycle m = PV/(RT), work per cylinder per cycle,
  power = m · w_net · n_cyl · (revs per power stroke) · (rpm / 60)

The default case reproduces the textbook result of **61.4% efficiency and
~80 kW at 2400 rpm** (hand-calculated, see equations section).

## Rankine cycle methodology

Steady-flow ideal Rankine cycle using standard steam-table data:

- State 1: saturated liquid at 10 kPa — h₁ = h_f = 191.81 kJ/kg
- State 2: isentropic pump — w_p = v_f·ΔP, h₂ ≈ 198.87 kJ/kg
- State 3: 7 MPa / 500 °C — h₃ = 3411.40 kJ/kg, s₃ = 6.8000 kJ/kg·K
- State 4: isentropic expansion — x₄ = (s₃ − s_f)/s_fg, h₄ ≈ 2154.28 kJ/kg
- w_t = h₃ − h₄, w_p = h₂ − h₁, w_net = w_t − w_p, q_in = h₃ − h₂
- η = w_net / q_in ≈ **38.9%**
- ṁ_steam = 100 000 kW / w_net ≈ **80 kg/s**
- ΔT_cw = Q̇_out/(ṁ_cw·c_p,w) ≈ **31.3 °C**

> **Steam-property disclaimer.** The engine uses exact steam-table anchor values
> at the two assignment state points (7 MPa/500 °C and 10 kPa). If you change the
> pressures or temperatures, off-anchor properties are estimated with documented
> approximations (ideal-gas superheat, Antoine saturation, Watson latent-heat
> correction) and the UI shows the warning banner accordingly. This is a teaching
> tool for the assigned cycle, not a general-purpose steam solver.

## Deployment (GitHub Pages)

The repository includes `.github/workflows/deploy.yml`, which builds the site and
publishes it to GitHub Pages on every push to `main`:

1. Push to `main` (the workflow runs `npm ci && npm run build`).
2. In **Settings → Pages → Build and deployment → Source**, choose
   **GitHub Actions**.
3. The site is available at `https://<user>.github.io/ThermoSim-203/`.

## Verification

- `npm run build` completes with `tsc --noEmit` (zero type errors) and a clean
  Vite production build.
- All numbers were cross-checked by hand against the textbook worked examples.
- An automated Playwright smoke suite (28 checks, run against the production
  build) covers rendering, both calculators, table contents, triggers,
  responsiveness and console cleanliness — **all passing, zero console errors**.