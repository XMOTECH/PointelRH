import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { staggerContainer, staggerItem, viewportConfig } from '../animations/landing.animations';
import type { Feature } from '../types/landing.types';

interface FeaturesGridProps {
  features: Feature[];
}

export function FeaturesGrid({ features }: FeaturesGridProps) {
  const navigate = useNavigate();

  return (
    <section id="features" className="scroll-mt-20 py-24 px-6 bg-on-surface">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="mb-16 md:flex justify-between items-end"
        >
          <SectionHeading
            title="L'excellence operationnelle, sans compromis technique."
            subtitle="LuminaRH combine une interface utilisateur de pointe avec une architecture backend prête pour l'échelle de l'entreprise."
            align="left"
            dark
            className="mb-0 max-w-2xl"
          />
          <button
            onClick={() => navigate('/login')}
            className="hidden md:flex text-sm bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-surface-container-lowest px-6 py-3 rounded-lg font-semibold transition-all items-center gap-2"
          >
            Voir toutes les fonctionnalites <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} variants={staggerItem} className="flex gap-4 group">
                <div className="shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/10 flex items-center justify-center border border-surface-container-lowest/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                    <Icon className="w-5 h-5 text-primary-container group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-surface-container-lowest mb-2">{f.title}</h3>
                  <p className="text-surface-container-lowest/60 leading-relaxed text-sm font-medium">{f.text}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
