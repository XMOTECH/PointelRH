import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../animations/landing.animations';
import { Button } from '@/components/ui/Button';
import dashboardImg from '/dashboard-preview.png';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/8 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container border border-primary-container mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary tracking-wide uppercase">
            SIRH Nouvelle Generation
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeInUp}
          className="font-space text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1] mb-6"
        >
          Centralisez vos plannings,{' '}
          <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
            automatisez vos process.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
        >
          De l'horodatage hybride a l'analytique avancee. La plateforme B2B qui redonne le controle
          aux DRH et la simplicite a vos equipes terrain.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto shadow-lg shadow-primary/20"
          >
            Demarrer gratuitement
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/login?intent=demo')}
            className="w-full sm:w-auto"
          >
            Echanger avec un expert
          </Button>
        </motion.div>

        {/* Trust line */}
        <motion.p variants={fadeInUp} className="text-sm font-medium text-on-surface-variant/60 mt-6 md:mb-16">
          Aucune carte de credit requise &bull; Deploiement en 3 a 5 jours ouvres
        </motion.p>

        {/* Dashboard mockup */}
        <motion.div variants={fadeInUp} className="relative max-w-6xl mx-auto mt-12 md:mt-16 px-4 sm:px-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 rounded-[100px] blur-[80px] -z-10" />
          <div className="relative rounded-2xl md:rounded-3xl border border-outline-variant bg-surface-container-lowest/40 backdrop-blur-xl p-2 md:p-4 shadow-premium ring-1 ring-on-surface/5">
            <div className="flex items-center gap-1.5 px-3 mb-3 md:mb-4 pt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
              <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
              <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
            </div>
            <img
              src={dashboardImg}
              alt="Tableau de bord LuminaRH — KPIs, graphiques de présence et répartition par département"
              className="w-full h-auto rounded-xl border border-outline-variant object-cover shadow-sm"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
