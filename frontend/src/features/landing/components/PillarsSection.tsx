import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { staggerContainer, staggerItem, viewportConfig } from '../animations/landing.animations';
import type { Pillar } from '../types/landing.types';

interface PillarsSectionProps {
  pillars: Pillar[];
}

export function PillarsSection({ pillars }: PillarsSectionProps) {
  return (
    <section id="solution" className="scroll-mt-20 py-24 px-6 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          title="Gerez le cycle de vie au quotidien"
          subtitle="Un ecosysteme concu pour eliminer les erreurs manuelles, reduire la friction operationnelle et fiabiliser la paie avant la cloture du mois."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                variants={staggerItem}
                className="premium-card p-8 group"
              >
                <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 border border-primary-container">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-space font-bold text-xl text-on-surface mb-3">{p.title}</h3>
                <p className="text-on-surface-variant leading-relaxed font-medium">{p.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
