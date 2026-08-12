import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from './SectionHeading';
import { staggerContainer, staggerItem, viewportConfig } from '../animations/landing.animations';
import type { Plan } from '../types/landing.types';

interface PricingSectionProps {
  plans: Plan[];
}

export function PricingSection({ plans }: PricingSectionProps) {
  const navigate = useNavigate();

  function handleCta(plan: Plan) {
    if (plan.ctaHref.startsWith('mailto:')) {
      window.location.href = plan.ctaHref;
    } else {
      navigate(plan.ctaHref);
    }
  }

  return (
    <section id="pricing" className="scroll-mt-20 py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          title="Une tarification transparente"
          subtitle="Investissez dans une solution qui justifie son retour sur investissement des le premier mois d'utilisation."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid lg:grid-cols-3 gap-8 items-stretch"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={staggerItem}
              className={cn(
                'relative flex flex-col p-8 rounded-2xl bg-surface-container-lowest border transition-all duration-300 hover:-translate-y-1',
                plan.popular
                  ? 'border-primary shadow-premium'
                  : 'border-outline-variant shadow-ambient hover:shadow-premium hover:border-surface-container-highest',
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-on-primary text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                    Recommande
                  </span>
                </div>
              )}

              <h3 className="font-space font-bold text-xl text-on-surface">{plan.name}</h3>
              <p className="text-sm font-medium text-on-surface-variant mt-2 mb-6 h-10">{plan.desc}</p>

              <div className="mb-8">
                <span className="font-space font-extrabold text-4xl text-on-surface">{plan.price}</span>
                {plan.unit && <span className="text-sm font-medium text-on-surface-variant ml-1">{plan.unit}</span>}
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm font-medium text-on-surface-variant">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => handleCta(plan)}
              >
                {plan.ctaLabel}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
