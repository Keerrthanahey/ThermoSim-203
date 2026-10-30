import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Accent } from './StatCard';

interface AnimatedStatProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  accent?: Accent;
  duration?: number;
}

export function AnimatedStat({
  label,
  value,
  suffix = '',
  prefix = '',
  accent = 'slate',
  duration = 2.5,
}: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;

        let startTime: number;
        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
          setDisplayValue(Math.floor(value * progress));
          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
      }
    });

    const id = `stat-${label}-${value}`;
    const el = document.getElementById(id);
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [value, duration, label]);

  return (
    <motion.div
      id={`stat-${label}-${value}`}
      className={`statcard accent-${accent}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <span className="statcard-label">{label}</span>
      <span className="statcard-value">
        {prefix}
        {displayValue}
        {suffix}
      </span>
    </motion.div>
  );
}
