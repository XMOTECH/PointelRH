/**
 * Utilitaires pour le planning hebdomadaire
 * - Contrat de grille stricte CSS Grid (8 colonnes indéformables)
 * - Suppression systématique des tirets du bas ("_")
 * - Palette de couleurs sémantiques style 7shifts / Deputy
 * - Formatage des durées et calculs
 */

// Contrat de grille strict et partagé (1 colonne identité de 250px + 7 colonnes jours égales)
export const PLANNING_GRID_COLS = 'grid grid-cols-[250px_repeat(7,minmax(145px,1fr))]';
export const PLANNING_MIN_WIDTH = 'min-w-[1265px]';

export interface ShiftPalette {
  accent: string;       // Couleur de la barre verticale gauche
  bg: string;           // Fond doux/pastel
  text: string;         // Texte principal (heures)
  subtext: string;      // Texte secondaire (poste/rôle)
  border: string;       // Bordure fine
}

/**
 * Extrait le nom complet d'un collaborateur en supportant à la fois
 * camelCase (firstName, lastName) et snake_case (first_name, last_name).
 */
export function getEmployeeFullName(employee?: any): string {
  if (!employee) return 'Collaborateur';
  if (employee.name && typeof employee.name === 'string' && employee.name.trim().length > 0) {
    return employee.name.trim();
  }
  const first = (employee.firstName || employee.first_name || '').trim();
  const last = (employee.lastName || employee.last_name || '').trim();
  const combined = `${first} ${last}`.trim();
  return combined || employee.email || 'Collaborateur';
}

/**
 * Nettoie et formate les chaînes pour supprimer les tirets du bas ("_")
 * et convertir les codes techniques en libellés lisibles.
 */
export function cleanLabel(text?: string | null): string {
  if (!text) return '';

  const clean = text.trim();

  // Dictionnaire des termes techniques fréquents
  const DICTIONARY: Record<string, string> = {
    // Statuts
    DRAFT: 'Brouillon',
    PUBLISHED: 'Publié',
    ARCHIVED: 'Archivé',
    CONFIRMED: 'Confirmé',
    CANCELLED: 'Annulé',
    PENDING: 'En attente',
    APPROVED: 'Validé',
    REJECTED: 'Refusé',

    // Départements / Équipes types
    KITCHEN_STAFF: 'Équipe Cuisine',
    SERVICE_STAFF: 'Équipe Service',
    ADMIN_STAFF: 'Administration',
    BAR_STAFF: 'Équipe Bar',
    CLEANING_STAFF: 'Entretien & Hygiène',
    ALL_DEPARTMENTS: 'Tous les départements',

    // Shifts
    OPEN_SHIFTS: 'Créneaux ouverts',
    OPEN_SHIFT: 'Créneau ouvert',
    UNASSIGNED: 'Non assigné',
    Shift: 'Créneau',
    SHIFT: 'Créneau',
    Chaufeur: 'Chauffeur',
    CHAUFEUR: 'Chauffeur',
    chaufeur: 'Chauffeur',

    // Types de congés
    PAID_LEAVE: 'Congé payé',
    UNPAID_LEAVE: 'Congé sans solde',
    SICK_LEAVE: 'Maladie',
    MATERNITY_LEAVE: 'Maternité',
    PATERNITY_LEAVE: 'Paternité',
    RTT: 'RTT',

    // Alertes de conformité
    LEAVE_CONFLICT: 'Conflit de congé',
    SHIFT_OVERLAP: 'Chevauchement de créneaux',
    DAILY_REST_INSUFFICIENT: 'Repos quotidien insuffisant (min. 11h)',
    MAX_DAILY_HOURS: 'Dépassement amplitude journalière (max. 10h)',
    MAX_WEEKLY_HOURS: 'Dépassement amplitude hebdomadaire (max. 48h)',
    CONSECUTIVE_DAYS: 'Plus de 6 jours consécutifs travaillés',
  };

  if (DICTIONARY[clean]) {
    return DICTIONARY[clean];
  }

  // Remplacement générique de tous les tirets du bas par des espaces
  return clean
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Palettes prédéfinies calquées sur l'UI de référence
 */
export const PALETTES: Record<string, ShiftPalette> = {
  purple: {
    accent: '#9333EA',   // purple-600
    bg: '#FAF5FF',       // purple-50
    text: '#581C87',     // purple-900
    subtext: '#7E22CE',  // purple-700
    border: '#E9D5FF',   // purple-200
  },
  teal: {
    accent: '#0D9488',   // teal-600
    bg: '#F0FDFA',       // teal-50
    text: '#134E4A',     // teal-900
    subtext: '#0F766E',  // teal-700
    border: '#99F6E4',   // teal-200
  },
  pink: {
    accent: '#DB2777',   // pink-600
    bg: '#FDF2F8',       // pink-50
    text: '#831843',     // pink-900
    subtext: '#BE185D',  // pink-700
    border: '#FBCFE8',   // pink-200
  },
  amber: {
    accent: '#EA580C',   // orange-600
    bg: '#FFF7ED',       // orange-50
    text: '#7C2D12',     // orange-900
    subtext: '#C2410C',  // orange-700
    border: '#FED7AA',   // orange-200
  },
  blue: {
    accent: '#2563EB',   // blue-600
    bg: '#EFF6FF',       // blue-50
    text: '#1E3A8A',     // blue-900
    subtext: '#1D4ED8',  // blue-700
    border: '#BFDBFE',   // blue-200
  },
  emerald: {
    accent: '#16A34A',   // green-600
    bg: '#F0FDF4',       // green-50
    text: '#14532D',     // green-900
    subtext: '#15803D',  // green-700
    border: '#BBF7D0',   // green-200
  },
  cyan: {
    accent: '#0891B2',   // cyan-600
    bg: '#ECFEFF',       // cyan-50
    text: '#164E63',     // cyan-900
    subtext: '#0E7490',  // cyan-700
    border: '#A5F3FC',   // cyan-200
  },
};

/**
 * Détermine la palette de couleurs d'un shift selon sa couleur ou son poste
 */
export function getShiftPalette(colorHex?: string, jobTitle?: string): ShiftPalette {
  if (colorHex) {
    const c = colorHex.toLowerCase();
    if (c.includes('8b5cf6') || c.includes('9333ea') || c.includes('a855f7')) return PALETTES.purple;
    if (c.includes('10b981') || c.includes('14b8a6') || c.includes('0d9488')) return PALETTES.teal;
    if (c.includes('ec4899') || c.includes('f43f5e') || c.includes('db2777')) return PALETTES.pink;
    if (c.includes('f59e0b') || c.includes('f97316') || c.includes('ea580c')) return PALETTES.amber;
    if (c.includes('06b6d4') || c.includes('0891b2')) return PALETTES.cyan;
    if (c.includes('22c55e') || c.includes('16a34a')) return PALETTES.emerald;
    if (c.includes('3b82f6') || c.includes('2563eb') || c.includes('6366f1')) return PALETTES.blue;
  }

  // Détection par métier si aucune couleur exacte
  if (jobTitle) {
    const title = jobTitle.toLowerCase();
    if (title.includes('sous-chef') || title.includes('second')) return PALETTES.purple;
    if (title.includes('chef') || title.includes('cuisine')) return PALETTES.teal;
    if (title.includes('commis') || title.includes('cuisinier') || title.includes('cook')) return PALETTES.pink;
    if (title.includes('hôte') || title.includes('accueil') || title.includes('host')) return PALETTES.amber;
    if (title.includes('bar') || title.includes('sommelier')) return PALETTES.blue;
    if (title.includes('serveur') || title.includes('waiter') || title.includes('salle')) return PALETTES.emerald;
  }

  return PALETTES.blue;
}

/**
 * Formate un nombre d'heures en notation française soignée (ex: "0 h", "35 h", "37h30")
 * Évite l'affichage de données brutes ("0:00", "0.0").
 */
export function formatWeeklyHours(hours: number): string {
  if (!hours || isNaN(hours) || hours <= 0) {
    return '0 h';
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) {
    return `${h} h`;
  }
  return `${h}h${m.toString().padStart(2, '0')}`;
}
