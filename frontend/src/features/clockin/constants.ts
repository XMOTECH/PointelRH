/**
 * Constants pour le module Clock-In
 * Centralisé pour éviter les magic strings et faciliter les modifications
 */

// Messages utilisateur
export const CLOCK_IN_MESSAGES = {
  title: 'Espace Pointage',
  description: 'Utilisez l\'application mobile pour scanner le QR Code sur site.',
  pending: 'Enregistrement...',
  success: 'Pointé avec succès',
  successDetail: (time: string) => `Votre présence a été enregistrée à ${time}.`,
  error: 'Erreur de pointage',
  lateWarning: (minutes: number) => `Pointe avec ${minutes} min de retard`,
  greeting: 'Pointage enregistré — bonjour !',
  // Clock-out
  clockOutTitle: 'Pointer la Sortie',
  clockOutPending: 'Enregistrement de la sortie...',
  clockOutSuccess: 'Sortie enregistrée',
  clockOutDescription: 'Enregistrez votre départ pour clôturer la journée.',
  dayComplete: 'Journée complète',
  dayCompleteDescription: 'Votre journée a été enregistrée avec succès.',
} as const;

// Taile des éléments UI
export const UI_SIZES = {
  iconSize: 32,
  statusIconSize: 20,
  qrCodeSize: 200,
  clockIconContainerSize: 64,
} as const;

// Espacements (padding, margin, gap)
export const SPACING = {
  base: '1rem',
  lg: '2rem',
  xl: '3rem',
  md: '1.5rem',
  sm: '0.5rem',
  xs: '0.75rem',
} as const;

// Rayons de bordure
export const BORDER_RADIUS = {
  sm: 'var(--radius-md)',
  md: 'var(--radius-lg)',
} as const;

// Couleurs partagées
export const COLORS = {
  success: '#2F855A',
  successBg: '#F0FFF4',
  successBorder: '#C6F6D5',
  error: '#C53030',
  errorBg: '#FFF5F5',
  errorBorder: '#FED7D7',
  warning: '#C05621',
  warningBg: '#FFFAF0',
  warningBorder: '#FEEBC8',
  neutral: '#718096',
  neutralBg: '#F7FAFC',
  neutralBorder: '#E2E8F0',
  primary: 'var(--primary)',
  primaryBgLight: 'rgba(0, 181, 173, 0.1)',
  textMuted: 'var(--text-muted)',
  textHeader: 'var(--text-header)',
  white: 'white',
  borderLight: 'var(--border-light)',
  shadowSm: 'var(--shadow-sm)',
} as const;

// Configurations QR Code
export const QR_CONFIG = {
  size: UI_SIZES.qrCodeSize,
  level: 'H' as const,
  errorCorrectionLevel: 'H',
} as const;

// Délais
export const DELAYS = {
  clockUpdateInterval: 1000, // ms - mise à jour horloge
} as const;

// Limites de texte
export const TEXT_LIMITS = {
  userIdDisplayLength: 8,
} as const;

// Grid Layout
export const LAYOUT = {
  containerMaxWidth: '500px',
  gridColumns: '1fr',
  gridGap: '2rem',
} as const;
