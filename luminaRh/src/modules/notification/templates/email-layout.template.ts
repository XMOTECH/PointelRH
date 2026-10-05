/**
 * Reusable HTML Email Base Layout
 */
export function renderEmailLayout(options: {
  title: string;
  badge?: string;
  contentHtml: string;
}): string {
  const badgeHtml = options.badge
    ? `<span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">${options.badge}</span>`
    : '';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 18px;">
        <h2 style="color: #0041c8; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">
          Lumina<span style="color: #3182ce;">RH</span>
        </h2>
        ${badgeHtml}
      </div>

      ${options.contentHtml}

      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0 20px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0; line-height: 1.5;">
        Cet email a été envoyé automatiquement par LuminaRH.<br />Merci de ne pas y répondre directement.
      </p>
    </div>
  `.trim();
}
