import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeInUp, viewportConfig } from '../animations/landing.animations';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  dark?: boolean;
  className?: string;
}

export function SectionHeading({ title, subtitle, align = 'center', dark = false, className }: SectionHeadingProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={fadeInUp}
      className={cn(
        'max-w-3xl mb-16',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <h2
        className={cn(
          'font-space text-3xl md:text-4xl font-bold mb-4',
          dark ? 'text-on-primary' : 'text-on-surface',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-lg leading-relaxed',
            dark ? 'text-on-primary/60' : 'text-on-surface-variant',
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
