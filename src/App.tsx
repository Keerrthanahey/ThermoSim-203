import { useMemo, useState } from 'react';
import './interactive.css';
import { assignment } from './data/assignment';
import type { CycleType, DieselInputs } from './lib/dieselCycle';
import { calculateDieselCycle, calculateDieselComparison, buildDieselCommentary } from './lib/dieselCycle';
import type { RankineInputs } from './lib/rankineCycle';
import { calculateRankineCycle, calculateRankineComparison, buildRankineCommentary } from './lib/rankineCycle';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DieselSection from './components/DieselSection';
import RankineSection from './components/RankineSection';
import AnalysisSection from './components/AnalysisSection';
import EquationsSection from './components/EquationsSection';
import Footer from './components/Footer';
import AnimatedReveal from './components/AnimatedReveal';

function defaultDieselInputs(): DieselInputs {
  const d = assignment.diesel;
  return { totalDisplacementL: d.totalDisplacementL, cylinders: d.cylinders, rpm: d.rpm, initialTemperatureC: d.initialTemperatureC, initialPressureKPa: d.initialPressureKPa, compressionRatio: d.compressionRatio, cutoffRatio: d.cutoffRatio, cycleType: d.cycle };
}
function defaultRankineInputs(): RankineInputs {
  const r = assignment.rankine;
  return { plantCapacityMW: r.plantCapacityMW, turbineInletPressureMPa: r.turbineInletPressureMPa, turbineInletTemperatureC: r.turbineInletTemperatureC, condenserPressureKPa: r.condenserPressureKPa, coolingWaterMassFlowKgS: r.coolingWaterMassFlowKgS, coolingWaterCp: r.coolingWaterCp };
}

export default function App() {
  const [dieselInputs, setDieselInputs] = useState<DieselInputs>(defaultDieselInputs);
  const [rankineInputs, setRankineInputs] = useState<RankineInputs>(defaultRankineInputs);
  const dieselResult = useMemo(() => calculateDieselCycle(dieselInputs), [dieselInputs]);
  const dieselRows = useMemo(() => calculateDieselComparison(dieselInputs, [...assignment.diesel.compressionRatios]), [dieselInputs]);
  const dieselCommentary = useMemo(() => buildDieselCommentary(dieselRows, dieselInputs), [dieselRows, dieselInputs]);
  const rankineResult = useMemo(() => calculateRankineCycle(rankineInputs), [rankineInputs]);
  const rankineRows = useMemo(() => calculateRankineComparison(rankineInputs, [...assignment.rankine.plantCapacitiesMW]), [rankineInputs]);
  const rankineCommentary = useMemo(() => buildRankineCommentary(rankineResult, rankineRows), [rankineResult, rankineRows]);
  const handleDieselChange = (field: keyof DieselInputs, value: number | CycleType) => setDieselInputs((prev) => ({ ...prev, [field]: value }));
  const handleRankineChange = (field: keyof RankineInputs, value: number) => setRankineInputs((prev) => ({ ...prev, [field]: value }));

  return <>
    <Navbar />
    <main>
      <Hero />
      <AnimatedReveal><DieselSection inputs={dieselInputs} result={dieselResult} rows={dieselRows} commentary={dieselCommentary} onInputChange={handleDieselChange} onReset={() => setDieselInputs(defaultDieselInputs())} /></AnimatedReveal>
      <AnimatedReveal delay={0.04}><RankineSection inputs={rankineInputs} result={rankineResult} rows={rankineRows} commentary={rankineCommentary} onInputChange={handleRankineChange} onReset={() => setRankineInputs(defaultRankineInputs())} /></AnimatedReveal>
      <AnimatedReveal delay={0.04}><AnalysisSection dieselInputs={dieselInputs} dieselRows={dieselRows} rankineResult={rankineResult} rankineRows={rankineRows} /></AnimatedReveal>
      <AnimatedReveal delay={0.04}><EquationsSection /></AnimatedReveal>
    </main>
    <Footer />
  </>;
}
