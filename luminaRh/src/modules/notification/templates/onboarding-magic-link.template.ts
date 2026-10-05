import { renderEmailLayout } from './email-layout.template';

export interface OnboardingMagicLinkEmailParams {
  candidateName?: string;
  portalUrl: string;
}

export function buildOnboardingMagicLinkEmail(params: OnboardingMagicLinkEmailParams) {
  const greeting = params.candidateName ? `Bonjour ${params.candidateName}` : 'Bonjour';
  const subject = "Bienvenue ! Complétez votre dossier d'intégration LuminaRH";

  const text = `${greeting},\n\nVotre parcours d'intégration a été créé avec succès.\n\nVeuillez accéder à votre portail sécurisé pour renseigner vos informations et transmettre vos justificatifs :\n${params.portalUrl}\n\nCe lien sécurisé est personnel et sans mot de passe requis.\n\nCordialement,\nL'équipe RH`;

  const contentHtml = `
    <p style="font-size: 16px; line-height: 1.6; color: #1e293b; margin-bottom: 16px;">
      ${greeting},
    </p>

    <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
      Félicitations et bienvenue dans l'équipe ! Votre dossier d'intégration a été initié. Afin de préparer au mieux votre arrivée et finaliser vos démarches administratives, merci de compléter vos informations et d'importer vos pièces justificatives (CNI, RIB, etc.).
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${params.portalUrl}" style="background-color: #0041c8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(0, 65, 200, 0.25);">
        Remplir mon dossier d'intégration →
      </a>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin: 24px 0;">
      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Lien direct :</p>
      <p style="margin: 0; font-size: 13px; font-family: monospace; word-break: break-all; color: #0041c8;">
        ${params.portalUrl}
      </p>
    </div>

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0; text-align: center;">
      Ce lien est sécurisé et ne nécessite aucun mot de passe.<br />Si vous avez des questions, veuillez contacter votre responsable RH.
    </p>
  `;

  return {
    subject,
    text,
    html: renderEmailLayout({
      title: subject,
      badge: "Portail d'Intégration & Onboarding",
      contentHtml,
    }),
  };
}
