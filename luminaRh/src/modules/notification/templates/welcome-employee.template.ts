import { renderEmailLayout } from './email-layout.template';

export interface WelcomeEmployeeEmailParams {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  loginUrl: string;
}

export function buildWelcomeEmployeeEmail(params: WelcomeEmployeeEmailParams) {
  const subject = 'Activation de votre compte LuminaRH';
  
  const text = `Bonjour ${params.firstName} ${params.lastName},\n\nVotre compte LuminaRH a été créé.\n\nIdentifiants :\nEmail: ${params.email}\nMot de passe temporaire: ${params.password || '(défini par votre administrateur)'}\n\nConnectez-vous sur ${params.loginUrl} pour l'activer.`;

  const contentHtml = `
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      Bonjour <strong>${params.firstName} ${params.lastName}</strong>,
    </p>
    
    <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
      Votre compte a été créé avec succès sur la plateforme <strong>LuminaRH</strong> par votre administrateur.
    </p>
    
    <div style="background-color: #f8fafc; border-left: 4px solid #0041c8; padding: 18px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
        Vos identifiants de connexion :
      </p>
      <p style="margin: 0 0 8px 0; font-size: 15px; color: #334155;">
        <strong>Email :</strong> ${params.email}
      </p>
      ${
        params.password
          ? `<p style="margin: 0; font-size: 15px; color: #334155;">
              <strong>Mot de passe temporaire :</strong> 
              <code style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-family: monospace; color: #0f172a;">${params.password}</code>
            </p>`
          : ''
      }
    </div>
    
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 12px 16px; margin: 20px 0; border-radius: 8px; font-size: 13px;">
      ℹ️ Lors de votre première connexion, il vous sera demandé de modifier ce mot de passe temporaire.
    </div>
    
    <div style="text-align: center; margin: 32px 0 24px 0;">
      <a href="${params.loginUrl}" style="background-color: #0041c8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 65, 200, 0.2);">
        Activer mon compte
      </a>
    </div>
  `;

  return {
    subject,
    text,
    html: renderEmailLayout({
      title: subject,
      badge: 'Plateforme de Gestion des Ressources Humaines',
      contentHtml,
    }),
  };
}
