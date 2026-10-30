import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

const variants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export default function AnimatedReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.14 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
