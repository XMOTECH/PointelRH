/**
 * Helpers for sharing Candidate Magic Links via WhatsApp, Email, or Clipboard.
 */

export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove spaces, dots, dashes, parentheses
  let cleaned = phone.replace(/[\s.\-()]/g, '');
  // If starts with +, strip + for WhatsApp wa.me links
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

export function buildMagicLink(token: string): string {
  if (!token) return '';
  return `${window.location.origin}/onboarding/portal/${token}`;
}

export function buildWhatsAppShareUrl(phone: string, candidateName: string, magicLink: string): string {
  const cleanPhone = sanitizePhoneNumber(phone);
  const greeting = candidateName ? `Bonjour ${candidateName}` : 'Bonjour';
  const text = `${greeting},\n\nBienvenue parmi nous ! Voici votre lien d'accès sécurisé pour compléter votre dossier d'intégration et téléverser vos pièces justificatives (CNI, RIB) :\n\n${magicLink}\n\nÀ très vite !`;
  
  if (!cleanPhone) {
    // If no phone provided, open WhatsApp with text ready to choose contact
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildMailtoShareUrl(email: string, candidateName: string, magicLink: string): string {
  const greeting = candidateName ? `Bonjour ${candidateName}` : 'Bonjour';
  const subject = `Votre dossier d'intégration et d'onboarding - LuminaRH`;
  const body = `${greeting},\n\nBienvenue dans l'équipe ! Nous sommes ravis de vous compter parmi nous.\n\nAfin de préparer au mieux votre arrivée et d'établir vos formalités administratives, merci de bien vouloir compléter vos informations et déposer vos pièces justificatives (CNI, RIB, situation matrimoniale) sur votre portail d'intégration sécurisé :\n\n${magicLink}\n\n(Ce lien est strictement personnel et ne nécessite aucun mot de passe).\n\nCordialement,\nL'équipe des Ressources Humaines`;

  return `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
