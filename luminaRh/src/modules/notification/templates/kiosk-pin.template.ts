import { renderEmailLayout } from './email-layout.template';

export interface KioskPinEmailParams {
  firstName: string;
  lastName: string;
  pinCode: string;
}

export function buildKioskPinEmail(params: KioskPinEmailParams) {
  const subject = 'Votre nouveau code PIN de pointage - LuminaRH';

  const text = `Bonjour ${params.firstName} ${params.lastName},\n\nUn nouveau code PIN de pointage vous a été attribué.\n\nVotre code PIN kiosque : ${params.pinCode}\n\nVous pouvez désormais utiliser ce code à 4 chiffres sur les tablettes et bornes de pointage kiosque.`;

  const contentHtml = `
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      Bonjour <strong>${params.firstName} ${params.lastName}</strong>,
    </p>
    
    <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
      Un nouveau code PIN individuel vous a été attribué par votre administrateur pour effectuer vos pointages sur les bornes Kiosque.
    </p>
    
    <div style="background-color: #f8fafc; border-left: 4px solid #0041c8; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
        VOTRE CODE PIN KIOSQUE
      </p>
      <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0041c8; font-family: monospace;">
        ${params.pinCode}
      </span>
    </div>
    
    <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
      Saisissez simplement ces 4 chiffres sur le pavé tactile du kiosque pour valider votre entrée ou votre sortie.
    </p>
  `;

  return {
    subject,
    text,
    html: renderEmailLayout({
      title: subject,
      badge: 'Plateforme RH & Pointage',
      contentHtml,
    }),
  };
}
