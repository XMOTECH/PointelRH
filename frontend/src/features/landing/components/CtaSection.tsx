import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeInUp, viewportConfig } from '../animations/landing.animations';

export function CtaSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 bg-primary text-center">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={fadeInUp}
        className="max-w-3xl mx-auto"
      >
        <h2 className="font-space text-3xl md:text-5xl font-bold text-on-primary mb-6">
          Pret a moderniser vos RH ?
        </h2>
        <p className="text-on-primary/70 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">
          Rejoignez les entreprises qui utilisent LuminaRH pour piloter leurs effectifs au quotidien.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="bg-on-primary text-primary px-8 py-3.5 rounded-xl font-bold text-base hover:bg-on-primary/90 transition-colors shadow-xl shadow-on-surface/20"
          >
            Commencer maintenant
          </button>
          <button
            onClick={() => navigate('/login?intent=demo')}
            className="bg-primary/80 text-on-primary border border-on-primary/20 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-primary/70 transition-colors"
          >
            Voir la demo produit
          </button>
        </div>
      </motion.div>
    </section>
  );
}
