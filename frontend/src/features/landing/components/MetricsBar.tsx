import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, viewportConfig } from '../animations/landing.animations';
import type { Metric } from '../types/landing.types';

interface MetricsBarProps {
  metrics: Metric[];
}

export function MetricsBar({ metrics }: MetricsBarProps) {
  return (
    <section className="border-y border-outline-variant bg-surface-container-lowest py-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={staggerContainer}
        className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
      >
        {metrics.map((m) => (
          <motion.div key={m.label} variants={staggerItem}>
            <p className="font-space font-bold text-3xl md:text-4xl text-on-surface">{m.value}</p>
            <p className="text-sm text-on-surface-variant font-medium mt-1">{m.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
