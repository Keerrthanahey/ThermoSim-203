import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import type { RankineComparisonRow, RankineResult } from '../lib/rankineCycle';
import { fmt } from '../lib/formatters';
import { chartPalette, tooltipStyle, axisTick } from './chartTheme';
import { ChartFrame } from './ChartFrame';

interface RankineChartsProps {
  rows: RankineComparisonRow[];
  result: RankineResult;
}

export default function RankineCharts({ rows, result }: RankineChartsProps) {
  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        capacityMw: r.plantCapacityMW,
        steamFlow: r.steamMassFlowKgS,
        dTcw: r.dTcwC,
        etaPct: r.etaThermal * 100,
        heatRejected: r.heatRejectedMW,
      })),
    [rows],
  );

  const enthalpyData = useMemo(
    () => [
      { state: '1', h: result.h1 },
      { state: '2', h: result.h2 },
      { state: '3', h: result.h3 },
      { state: '4', h: result.h4 },
    ],
    [result],
  );

  const barColors = [chartPalette.blue, chartPalette.cyan, chartPalette.teal, chartPalette.amber];

  const flowTooltip = (value: number) => [`${fmt(value)} kg/s`, 'Steam mass flow'];
  const dTcwTooltip = (value: number) => [`${fmt(value)} °C`, 'Cooling-water temperature rise'];
  const etaTooltip = (value: number) => [`${fmt(value)} %`, 'Thermal efficiency'];

  return (
    <div className="chart-grid">
      <ChartFrame title="Plant Capacity vs Steam Mass Flow" subtitle="ṁ_steam = Ẇ_plant / w_net — linear scaling">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="rgba(120,150,200,0.12)" vertical={false} />
            <XAxis dataKey="capacityMw" tick={axisTick} stroke="rgba(120,150,200,0.3)" label={{ value: 'Plant capacity (MW)', position: 'insideBottom', offset: -2, fill: '#7c8db0', fontSize: 12 }} />
            <YAxis tick={axisTick} stroke="rgba(120,150,200,0.3)" tickFormatter={(v: number) => fmt(v)} width={54} />
            <Tooltip contentStyle={tooltipStyle} formatter={flowTooltip} labelFormatter={(label) => `${label} MW plant`} />
            <Line type="monotone" dataKey="steamFlow" name="Steam flow" stroke={chartPalette.blue} strokeWidth={2.5} dot={{ r: 4, fill: chartPalette.blue }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Plant Capacity vs Cooling-Water Temperature Rise" subtitle="Fixed cooling flow of 1200 kg/s">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="rgba(120,150,200,0.12)" vertical={false} />
            <XAxis dataKey="capacityMw" tick={axisTick} stroke="rgba(120,150,200,0.3)" label={{ value: 'Plant capacity (MW)', position: 'insideBottom', offset: -2, fill: '#7c8db0', fontSize: 12 }} />
            <YAxis tick={axisTick} stroke="rgba(120,150,200,0.3)" tickFormatter={(v: number) => fmt(v)} width={54} />
            <Tooltip contentStyle={tooltipStyle} formatter={dTcwTooltip} labelFormatter={(label) => `${label} MW plant`} />
            <Line type="monotone" dataKey="dTcw" name="ΔT cooling water" stroke={chartPalette.cyan} strokeWidth={2.5} dot={{ r: 4, fill: chartPalette.cyan }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Plant Capacity vs Thermal Efficiency" subtitle="Same ideal cycle — efficiency is capacity independent">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="rgba(120,150,200,0.12)" vertical={false} />
            <XAxis dataKey="capacityMw" tick={axisTick} stroke="rgba(120,150,200,0.3)" label={{ value: 'Plant capacity (MW)', position: 'insideBottom', offset: -2, fill: '#7c8db0', fontSize: 12 }} />
            <YAxis tick={axisTick} stroke="rgba(120,150,200,0.3)" tickFormatter={(v: number) => fmt(v)} width={54} domain={[0, 'auto']} />
            <Tooltip contentStyle={tooltipStyle} formatter={etaTooltip} labelFormatter={(label) => `${label} MW plant`} />
            <Line type="monotone" dataKey="etaPct" name="Efficiency" stroke={chartPalette.teal} strokeWidth={2.5} dot={{ r: 4, fill: chartPalette.teal }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Rankine State Enthalpies" subtitle="Specific enthalpy at each cycle state point">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enthalpyData} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="rgba(120,150,200,0.12)" vertical={false} />
            <XAxis dataKey="state" tick={axisTick} stroke="rgba(120,150,200,0.3)" label={{ value: 'State point', position: 'insideBottom', offset: -2, fill: '#7c8db0', fontSize: 12 }} />
            <YAxis tick={axisTick} stroke="rgba(120,150,200,0.3)" tickFormatter={(v: number) => fmt(v)} width={54} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${fmt(value)} kJ/kg`, 'Enthalpy']} labelFormatter={(label) => `State ${label}`} cursor={{ fill: 'rgba(120,150,200,0.08)' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="h" name="Enthalpy h (kJ/kg)" radius={[4, 4, 0, 0]}>
              {enthalpyData.map((entry, i) => (
                <Cell key={entry.state} fill={barColors[i % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}