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
} from 'lucide-react';
import type { NavLink, Pillar, Feature, Plan, Faq, Metric, FooterLinkGroup, SocialLink } from '../types/landing.types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Produit', href: '#solution' },
  { label: 'Fonctionnalites', href: '#features' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export const PILLARS: Pillar[] = [
  {
    icon: MapPin,
    title: 'Pointage Securise & Geolocalise',
    desc: 'Digitalisez les entrees et sorties via QR Code ou Kiosque. La geolocalisation garantit la presence sur les chantiers ou sites assignes en temps reel.',
  },
  {
    icon: Calendar,
    title: 'Planification Intelligente',
    desc: "Batissez des plannings complexes en quelques clics. Gerez les absences, les conges et les missions avec un systeme d'approbation fluide.",
  },
  {
    icon: BarChart3,
    title: 'Pilotage & Analytique RH',
    desc: "Tableaux de bord dynamiques, taux d'absenteisme, calcul automatique des heures supplementaires. Des donnees fiables pour prendre les bonnes decisions.",
  },
];

export const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    title: 'Securite Maximale',
    text: 'Chiffrement AES-256, authentification JWT et conformite stricte aux normes RGPD pour proteger vos donnees.',
  },
  {
    icon: Globe2,
    title: 'Gestion Multi-Sites',
    text: 'Definissez des perimetres GPS specifiques pour chaque succursale, chantier ou bureau de votre organisation.',
  },
  {
    icon: Smartphone,
    title: 'Application Native',
    text: 'Une experience fluide et sans friction sur iOS et Android, permettant aux employes de pointer meme hors-connexion.',
  },
  {
    icon: LinkIcon,
    title: 'API & Integrations',
    text: 'API REST ouverte, webhooks et exports CSV automatiques vers vos principaux logiciels de paie (Sage, SAP...).',
  },
  {
    icon: Users,
    title: 'Architecture Multi-Tenant',
    text: "Isolation complete des donnees garantissant aux grandes entreprises une separation etanche des environnements.",
  },
  {
    icon: Zap,
    title: 'Deploiement Eclair',
    text: "Un onboarding guide et un parametrage concu pour un deploiement sur l'ensemble de vos sites en 3 a 5 jours ouvres.",
  },
];

export const PLANS: Plan[] = [
  {
    name: 'Starter',
    desc: 'Pour les PMEs cherchant a digitaliser le pointage.',
    price: '15 000',
    unit: 'FCFA / employe / mois',
    features: [
      "Jusqu'a 50 employes",
      'Pointage QR Code & Kiosque',
      'Gestion basique des plannings',
      'Demandes de conges',
      'Support par email',
    ],
    ctaLabel: "Commencer l'essai",
    ctaHref: '/login?plan=starter',
  },
  {
    name: 'Business',
    desc: 'La solution complete pour optimiser la GRH.',
    price: '25 000',
    unit: 'FCFA / employe / mois',
    popular: true,
    features: [
      'Employes illimites',
      'Validation par Geofencing (GPS)',
      'Suivi detaille des Missions',
      'Analytique & Tableaux de bord',
      'API & Exports Paie',
      'Support prioritaire',
    ],
    ctaLabel: "Commencer l'essai",
    ctaHref: '/login?plan=business',
  },
  {
    name: 'Enterprise',
    desc: 'Pour les organisations aux contraintes complexes.',
    price: 'Sur mesure',
    unit: '',
    features: [
      'Toutes les fonctionnalites Business',
      'SSO & Active Directory',
      'Architecture On-Premise possible',
      'SLA Garanti (99.9%)',
      'Account Manager dedie',
      'Formation sur site incluse',
    ],
    ctaLabel: "Contacter l'equipe",
    ctaHref: 'mailto:contact@luminarh.com',
  },
];

export const FAQS: Faq[] = [
  {
    q: 'Comment le systeme valide-t-il les pointages ?',
    a: "Chaque collaborateur dispose d'un QR Code dynamique via son application mobile, scanne par un manager ou un terminal Kiosque. Nous croisons cela avec la geolocalisation pour garantir la presence effective sur le site.",
  },
  {
    q: "Que se passe-t-il en cas de coupure Internet ?",
    a: "Nos applications mobiles (iOS et Android) disposent d'un mode hors-ligne natif. Les pointages sont stockes localement de maniere securisee et synchronises automatiquement avec les serveurs des le retablissement de la connexion.",
  },
  {
    q: 'Combien de temps faut-il pour déployer LuminaRH ?',
    a: "Grâce à notre architecture modulaire, la mise en service standard s'effectue en moins de 48 heures. Vos équipes importent vos référentiels (employés, plannings) et le système est immédiatement opérationnel.",
  },
  {
    q: 'Nos donnees RH sont-elles en securite ?',
    a: "Absolument. Nous appliquons les standards de securite de l'industrie bancaire : chiffrement AES-256 des donnees au repos, TLS 1.3 en transit, backups multi-zones quotidiens, et stricte conformite RGPD.",
  },
  {
    q: "Est-il possible d'exporter les données vers notre logiciel de paie ?",
    a: "Oui. LuminaRH propose des exports standardisés (Excel/CSV) configurables pour la majorité des outils du marché, ainsi qu'une API REST documentée pour une interopérabilité de bout en bout.",
  },
];

export const METRICS: Metric[] = [
  { value: '15 000+', label: 'Employes geres chaque mois' },
  { value: '99.8%', label: 'Disponibilite de la plateforme' },
  { value: '45%', label: 'Reduction des erreurs de pointage' },
  { value: '< 5 min', label: 'Deploiement moyen par site' },
];

export const FOOTER_LINKS: FooterLinkGroup[] = [
  {
    heading: 'Produit',
    links: [
      { label: 'Fonctionnalites', href: '#features' },
      { label: 'Securite', href: '#features' },
      { label: 'Integrations', href: '#features' },
      { label: 'Tarifs', href: '#pricing' },
    ],
  },
  {
    heading: 'Ressources',
    links: [
      { label: "Centre d'aide", href: '#' },
      { label: 'Documentation API', href: '#' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Mentions legales', href: '#' },
      { label: 'Politique de confidentialite', href: '#' },
      { label: 'CGV & CGU', href: '#' },
      { label: 'Conformite RGPD', href: '#' },
    ],
  },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { name: 'X / Twitter', href: 'https://x.com', spriteId: 'x-icon' },
  { name: 'GitHub', href: 'https://github.com', spriteId: 'github-icon' },
  { name: 'Bluesky', href: 'https://bsky.app', spriteId: 'bluesky-icon' },
];
