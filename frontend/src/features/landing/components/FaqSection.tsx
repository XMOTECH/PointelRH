import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import type { Faq } from '../types/landing.types';

interface FaqSectionProps {
  faqs: Faq[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-20 py-24 px-6 bg-surface-container-lowest border-t border-outline-variant">
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          title="Questions frequentes"
          subtitle="Tout ce que vous devez savoir pour passer au niveau superieur."
        />

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-outline-variant rounded-xl bg-surface-container-lowest overflow-hidden hover:border-surface-container-highest transition-colors"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-on-surface">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-on-surface-variant transition-transform duration-200 ${
                    openIdx === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="px-6 pb-5 text-on-surface-variant font-medium leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
