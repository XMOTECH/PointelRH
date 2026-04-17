import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  MapPin,
  Calendar,
  BarChart3,
  ShieldCheck,
  Globe2,
  Smartphone,
  Link as LinkIcon,
  Users,
  Zap,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Produit', href: '#solution' },
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const PILLARS = [
  {
    icon: MapPin,
    title: 'Pointage Sécurisé & Géolocalisé',
    desc: 'Digitalisez les entrées et sorties via QR Code ou Kiosque. La géolocalisation garantit la présence sur les chantiers ou sites assignés en temps réel.',
  },
  {
    icon: Calendar,
    title: 'Planification Intelligente',
    desc: 'Bâtissez des plannings complexes en quelques clics. Gérez les absences, les congés et les missions avec un système d\'approbation fluide.',
  },
  {
    icon: BarChart3,
    title: 'Pilotage & Analytique RH',
    desc: 'Tableaux de bord dynamiques, taux d\'absentéisme, calcul automatique des heures supplémentaires. Des données fiables pour prendre les bonnes décisions.',
  },
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Sécurité Maximale', text: 'Chiffrement AES-256, authentification JWT et conformité stricte aux normes RGPD pour protéger vos données.' },
  { icon: Globe2, title: 'Gestion Multi-Sites', text: 'Définissez des périmètres GPS spécifiques pour chaque succursale, chantier ou bureau de votre organisation.' },
  { icon: Smartphone, title: 'Application Native', text: 'Une expérience fluide et sans friction sur iOS et Android, permettant aux employés de pointer même hors-connexion.' },
  { icon: LinkIcon, title: 'API & Intégrations', text: 'API REST ouverte, webhooks et exports CSV automatiques vers vos principaux logiciels de paie (Sage, SAP...).' },
  { icon: Users, title: 'Architecture Multi-Tenant', text: 'Isolation complète des données garantissant aux grandes entreprises une séparation étanche des environnements.' },
  { icon: Zap, title: 'Déploiement Éclair', text: 'Un onboarding guidé et un paramétrage conçu pour un déploiement sur l\'ensemble de vos sites en 3 à 5 jours.' },
];

const PLANS = [
  {
    name: 'Starter',
    desc: 'Pour les PMEs cherchant à digitaliser le pointage.',
    price: '15 000',
    unit: 'FCFA / employé / mois',
    features: ['Jusqu\'à 50 employés', 'Pointage QR Code & Kiosque', 'Gestion basique des plannings', 'Demandes de congés', 'Support par email'],
  },
  {
    name: 'Business',
    desc: 'La solution complète pour optimiser la GRH.',
    price: '25 000',
    unit: 'FCFA / employé / mois',
    popular: true,
    features: ['Employés illimités', 'Validation par Géofencing (GPS)', 'Suivi détaillé des Missions', 'Analytique & Tableaux de bord', 'API & Exports Paie', 'Support prioritaire'],
  },
  {
    name: 'Enterprise',
    desc: 'Pour les organisations aux contraintes complexes.',
    price: 'Sur mesure',
    unit: '',
    features: ['Toutes les fonctionnalités Business', 'SSO & Active Directory', 'Architecture On-Premise possible', 'SLA Garanti (99.9%)', 'Account Manager dédié', 'Formation sur site incluse'],
  },
];

const FAQS = [
  { q: 'Comment le système valide-t-il les pointages ?', a: 'Chaque collaborateur dispose d\'un QR Code dynamique via son application mobile, scanné par un manager ou un terminal Kiosque. Nous croisons cela avec la géolocalisation pour garantir la présence effective sur le site.' },
  { q: 'Que se passe-t-il en cas de coupure Internet ?', a: 'Nos applications mobiles (iOS et Android) disposent d\'un mode hors-ligne natif. Les pointages sont stockés localement de manière sécurisée et synchronisés automatiquement avec les serveurs dès le rétablissement de la connexion.' },
  { q: 'Combien de temps faut-il pour déployer PointelRH ?', a: 'Grâce à notre infrastructure cloud et nos scripts d\'importation de masse, le déploiement technique est instantané. Comptez de 3 à 5 jours ouvrés pour configurer vos règles métiers complètes et former vos équipes administratives.' },
  { q: 'Nos données RH sont-elles en sécurité ?', a: 'Absolument. Nous appliquons les standards de sécurité de l\'industrie bancaire : chiffrement AES-256 des données au repos, TLS 1.3 en transit, backups multi-zones quotidiens, et stricte conformité RGPD.' },
  { q: 'La solution s\'interface-t-elle avec notre logiciel de paie ?', a: 'Oui. PointelRH propose des exports standardisés (Excel/CSV) configurables pour la majorité des outils du marché, ainsi qu\'une API REST documentée pour une interopérabilité de bout en bout.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter font-sans">
      
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
               <span className="text-white font-bold font-space text-sm">P</span>
            </div>
            <span className="font-space font-extrabold text-xl tracking-tight text-slate-900">
              Pointel<span className="text-blue-600">RH</span>
            </span>
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
              Espace Client
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
            >
              Demander une démo <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button className="md:hidden text-slate-600 p-2" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-4 overflow-hidden"
            >
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobileNav(false)} className="block text-sm font-medium text-slate-600">
                  {l.label}
                </a>
              ))}
              <hr className="border-slate-100" />
              <button onClick={() => navigate('/login')} className="w-full text-left text-sm font-semibold text-slate-700">
                Espace Client
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="w-full text-sm bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                Demander une démo <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={heroVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">SIRH Nouvelle Génération</span>
          </motion.div>
          
          <motion.h1 variants={heroVariants} className="font-space text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Centralisez vos plannings, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">automatisez vos process.</span>
          </motion.h1>
          
          <motion.p variants={heroVariants} className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            De l'horodatage hybride à l'analytique avancée. La plateforme B2B qui redonne le contrôle aux DRH et la simplicité à vos équipes terrain.
          </motion.p>
          
          <motion.div variants={heroVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              Démarrer gratuitement
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-semibold text-base hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Échanger avec un expert
            </button>
          </motion.div>
          <motion.p variants={heroVariants} className="text-sm font-medium text-slate-500 mt-6 md:mb-16">
            Aucune carte de crédit requise • Déploiement en 5 jours
          </motion.p>
          
          {/* Product Dashboard Mockup */}
          <motion.div 
            variants={heroVariants}
            className="relative max-w-6xl mx-auto mt-12 md:mt-16 px-4 sm:px-0"
          >
            {/* Glow effect behind the image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 rounded-[100px] blur-[80px] -z-10" />
            
            <div className="relative rounded-2xl md:rounded-3xl border border-white/40 bg-white/40 backdrop-blur-xl p-2 md:p-4 shadow-2xl shadow-blue-900/10 ring-1 ring-slate-900/5">
              {/* Fake Browser window top bar for premium look */}
              <div className="flex items-center gap-1.5 px-3 mb-3 md:mb-4 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              </div>
              <img 
                src="/dashboard-preview.png" 
                alt="Aperçu du Tableau de bord PointelRH" 
                className="w-full h-auto rounded-xl border border-slate-200/50 object-cover shadow-sm"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Social Proof (Mock) ── */}
      <section className="border-y border-slate-200/60 bg-white py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">La confiance des entreprises leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
            {/* Logos placeholders (text based for now, standard B2B pattern) */}
            <h3 className="font-space font-bold text-2xl text-slate-800">Acme Corp</h3>
            <h3 className="font-space font-bold text-xl text-slate-800">GlobalTech</h3>
            <h3 className="font-space font-bold text-2xl text-slate-800">Innova Industries</h3>
            <h3 className="font-space font-bold text-xl text-slate-800">Nexus</h3>
          </div>
        </div>
      </section>

      {/* ── Product Pillars ── */}
      <section id="solution" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={heroVariants}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-space text-3xl md:text-4xl font-bold text-slate-900 mb-4">Gérez le cycle de vie au quotidien</h2>
            <p className="text-lg text-slate-600">Un écosystème conçu pour éliminer les erreurs manuelles, réduire la friction opérationnelle et fiabiliser la paie avant la clôture du mois.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <motion.div variants={itemVariants} key={idx} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 border border-blue-200/50">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-space font-bold text-xl text-slate-900 mb-3">{p.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{p.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section id="features" className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={heroVariants}
            className="mb-16 md:flex justify-between items-end"
          >
            <div className="max-w-2xl">
              <h2 className="font-space text-3xl md:text-4xl font-bold mb-4">L'excellence opérationnelle, sans compromis technique.</h2>
              <p className="text-slate-400 text-lg">PointelRH combine une interface utilisateur de pointe avec une architecture backend prête pour l'échelle de l'entreprise (Enterprise-grade).</p>
            </div>
            <button 
              onClick={() => navigate('/login')} 
              className="hidden md:flex text-sm bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-all items-center gap-2"
            >
              Voir toutes les fonctionnalités <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
          >
            {FEATURES.map((f, idx) => {
              const Icon = f.icon;
              return (
                <motion.div variants={itemVariants} key={idx} className="flex gap-4 group">
                  <div className="shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/50 group-hover:bg-blue-900/50 group-hover:border-blue-500/30 transition-all duration-300">
                      <Icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-100 mb-2">{f.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm font-medium">{f.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={heroVariants}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-space text-3xl md:text-4xl font-bold text-slate-900 mb-4">Une tarification transparente</h2>
            <p className="text-lg text-slate-600">Investissez dans une solution qui justifie son retour sur investissement dès le premier mois d'utilisation.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid lg:grid-cols-3 gap-8 items-stretch"
          >
            {PLANS.map((plan, idx) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className={`relative flex flex-col p-8 rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-blue-600 shadow-xl shadow-blue-900/10' 
                    : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                      Recommandé
                    </span>
                  </div>
                )}
                
                <h3 className="font-space font-bold text-xl text-slate-900">{plan.name}</h3>
                <p className="text-sm font-medium text-slate-500 mt-2 mb-6 h-10">{plan.desc}</p>
                
                <div className="mb-8">
                  <span className="font-space font-extrabold text-4xl text-slate-900">{plan.price}</span>
                  {plan.unit && <span className="text-sm font-medium text-slate-500 ml-1">{plan.unit}</span>}
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                      : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {plan.price === 'Sur mesure' ? 'Contacter l\'équipe' : 'Commencer l\'essai'}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 bg-white border-t border-slate-200/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-space text-3xl md:text-4xl font-bold text-slate-900 mb-4">Questions fréquentes</h2>
            <p className="text-lg text-slate-600">Tout ce que vous devez savoir pour passer au niveau supérieur.</p>
          </div>
          
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl bg-white overflow-hidden hover:border-slate-300 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-semibold text-slate-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="px-6 pb-5 text-slate-600 font-medium leading-relaxed">
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

      {/* ── CTA Final ── */}
      <section className="py-24 px-6 bg-blue-600 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-space text-3xl md:text-5xl font-bold text-white mb-6">Prêt à moderniser vos RH ?</h2>
          <p className="text-blue-100 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">
            Rejoignez les entreprises qui utilisent PointelRH pour piloter leurs effectifs au quotidien.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-blue-50 transition-colors shadow-xl shadow-blue-900/20"
            >
              Commencer maintenant
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="bg-blue-700 text-white border border-blue-500 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-blue-800 transition-colors"
            >
              Voir la démo produit
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 pt-16 pb-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
               <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-inner">
                 <span className="text-white font-bold font-space text-sm">P</span>
               </div>
               <span className="font-space font-bold text-xl text-white">
                 Pointel<span className="text-blue-500">RH</span>
               </span>
            </a>
            <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-sm">
              La plateforme SIRH B2B conçue pour centraliser le pointage, optimiser la planification et automatiser la gestion des temps.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Produit</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Fonctionnalités</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Sécurité</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Intégrations</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Tarifs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Ressources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Centre d'aide</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Blog</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Documentation API</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Webinaires</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Mentions légales</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Politique de confidentialité</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">CGV & CGU</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Conformité RGPD</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} PointelRH. Tous droits réservés.</p>
          <div className="flex gap-4">
             {/* Social Links placeholders */}
             <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors" />
             <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors" />
             <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
