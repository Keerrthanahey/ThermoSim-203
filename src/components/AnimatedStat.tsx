import { useEffect, useState } from 'react';
import { useInView, useMotionValue, animate } from 'framer-motion';
import { useRef } from 'react';

function parseNumeric(value: string) {
  const match = value.match(/-?[0-9]+(?:\.[0-9]+)?/);
  if (!match) return null;
  return { number: Number(match[0]), prefix: value.slice(0, match.index), suffix: value.slice((match.index ?? 0) + match[0].length) };
}

export default function AnimatedStat({ label, value, hint, accent = 'slate' }: { label: string; value: string; hint?: string; accent?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const parsed = parseNumeric(value);
  const motionValue = useMotionValue(parsed?.number ?? 0);
  const [display, setDisplay] = useState(parsed?.number?.toString() ?? value);

  useEffect(() => {
    if (!inView || !parsed) return;
    const controls = animate(motionValue, parsed.number, { duration: 0.9, ease: 'easeOut' });
    return controls.stop;
  }, [inView, parsed?.number]);

  useEffect(() => motionValue.on('change', (latest) => {
    setDisplay(Math.abs(latest - Math.round(latest)) < 0.001 ? String(Math.round(latest)) : latest.toFixed(1));
  }), [motionValue]);

  return (
    <div ref={ref} className={`statcard accent-${accent}`}>
      <span className="statcard-label">{label}</span>
      <span className="statcard-value">{parsed ? `${parsed.prefix}${display}${parsed.suffix}` : value}</span>
      {hint && <span className="statcard-hint">{hint}</span>}
    </div>
  );
}
