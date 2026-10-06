import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { DieselComparisonRow } from '../lib/dieselCycle';
import { fmt } from '../lib/formatters';
import { chartPalette, tooltipStyle, axisTick, tickKw, tickPct } from './chartTheme';
import { ChartFrame } from './ChartFrame';

interface DieselChartsProps {
  rows: DieselComparisonRow[];
}

export default function DieselCharts({ rows }: DieselChartsProps) {
  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        r: r.compressionRatio,
        powerKw: r.powerKW,
        etaPct: r.etaThermal * 100,
        wNet: r.wNetKJkg,
        t1c: r.t1C,
        t2c: r.t2C,
        t3c: r.t3C,
        t4c: r.t4C,
      })),
    [rows],
  );

  const powerTooltip = (value: number) => [`${fmt(value)} kW`, 'Power output'];
  const etaTooltip = (value: number) => [`${fmt(value)} %`, 'Thermal efficiency'];
  const wTooltip = (value: number) => [`${fmt(value)} kJ/kg`, 'Net specific work'];
  const tTooltip = (value: number, name: string) => [`${fmt(value)} °C`, name];

  return (
    <div className="chart-grid">
      <ChartFrame title="Power Output vs Compression Ratio" subtitle="Engine power at 2400 rpm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="rgba(120,150,200,0.12)" vertical={false} />
            <XAxis dataKey="r" tick={axisTick} stroke="rgba(120,150,200,0.3)" label={{ value: 'Compression ratio, r', position: 'insideBottom', offset: -2, fill: '#7c8db0', fontSize: 12 }} />
            <YAxis tick={axisTick} stroke="rgba(120,150,200,0.3)" tickFormatter={(v: number) => tickKw(v)} width={54} />
            <Tooltip contentStyle={tooltipStyle} formatter={powerTooltip} labelFormatter={(label) => `r = ${label}`} />
            <Line type="monotone" dataKey="powerKw" name="Power" stroke={chartPalette.blue} isAnimationActive={false} strokeWidth={2.5} dot={{ r: 4, fill: chartPalette.blue }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Thermal Efficiency vs Compression Ratio" subtitle="Cold-air-standard ideal Diesel cycle">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="rgba(120,150,200,0.12)" vertical={false} />
            <XAxis dataKey="r" tick={axisTick} stroke="rgba(120,150,200,0.3)" label={{ value: 'Compression ratio, r', position: 'insideBottom', offset: -2, fill: '#7c8db0', fontSize: 12 }} />
            <YAxis tick={axisTick} stroke="rgba(120,150,200,0.3)" tickFormatter={(v: number) => tickPct(v / 100)} width={54} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} formatter={etaTooltip} labelFormatter={(label) => `r = ${label}`} />
            <Line type="monotone" dataKey="etaPct" name="Efficiency" stroke={chartPalette.teal} isAnimationActive={false} strokeWidth={2.5} dot={{ r: 4, fill: chartPalette.teal }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Net Specific Work vs Compression Ratio" subtitle="Work per kg of air per cycle">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="rgba(120,150,200,0.12)" vertical={false} />
            <XAxis dataKey="r" tick={axisTick} stroke="rgba(120,150,200,0.3)" label={{ value: 'Compression ratio, r', position: 'insideBottom', offset: -2, fill: '#7c8db0', fontSize: 12 }} />
            <YAxis tick={axisTick} stroke="rgba(120,150,200,0.3)" tickFormatter={(v: number) => `${fmt(v)}`} width={54} />
            <Tooltip contentStyle={tooltipStyle} formatter={wTooltip} labelFormatter={(label) => `r = ${label}`} />
            <Line type="monotone" dataKey="wNet" name="Net work" stroke={chartPalette.cyan} isAnimationActive={false} strokeWidth={2.5} dot={{ r: 4, fill: chartPalette.cyan }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Temperature at Cycle States" subtitle="State temperatures for each compression-ratio scenario">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 20, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="rgba(120,150,200,0.12)" vertical={false} />
            <XAxis dataKey="r" tick={axisTick} stroke="rgba(120,150,200,0.3)" label={{ value: 'Compression ratio, r', position: 'insideBottom', offset: -2, fill: '#7c8db0', fontSize: 12 }} />
            <YAxis tick={axisTick} stroke="rgba(120,150,200,0.3)" tickFormatter={(v: number) => `${fmt(v)}`} width={54} />
            <Tooltip contentStyle={tooltipStyle} formatter={tTooltip} labelFormatter={(label) => `r = ${label}`} />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" />
            <Line type="monotone" dataKey="t1c" name="T₁" stroke={chartPalette.gray} isAnimationActive={false} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="t2c" name="T₂" stroke={chartPalette.blue} isAnimationActive={false} strokeWidth={2.2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="t3c" name="T₃" stroke={chartPalette.amber} isAnimationActive={false} strokeWidth={2.2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="t4c" name="T₄" stroke={chartPalette.violet} isAnimationActive={false} strokeWidth={2.2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}