import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// @ts-ignore
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private isConfigured = false;
  private fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const smtpHost = this.config.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const smtpPort = Number(this.config.get('SMTP_PORT', 587));
    const smtpSecure = this.config.get('SMTP_SECURE') === 'true' || this.config.get('SMTP_SECURE') === true;
    const rawUser = this.config.get<string>('SMTP_USER', '');
    const rawPass = this.config.get<string>('SMTP_PASS', '');
    const smtpUser = rawUser ? rawUser.replace(/^["']|["']$/g, '').trim() : undefined;
    const smtpPass = rawPass ? rawPass.replace(/^["']|["']$/g, '').replace(/\s+/g, '').trim() : undefined;

    this.fromAddress = this.config.get<string>('SMTP_FROM', 'LuminaRH <noreply@luminarh.sn>');

    if (!smtpUser || !smtpPass) {
      this.logger.warn('[MailService] SMTP_USER ou SMTP_PASS non configuré. Les emails sortiront en mode silencieux.');
      this.isConfigured = false;
    } else {
      this.isConfigured = true;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      requireTLS: !smtpSecure,
      auth: (smtpUser && smtpPass) ? { user: smtpUser, pass: smtpPass } : undefined,
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  /**
   * Envoi d'email asynchrone non-bloquant pour ne pas ralentir le cycle de requête HTTP.
   */
  async sendMail(options: SendMailOptions): Promise<void> {
    if (!options.to) {
      this.logger.warn('[MailService] Tentative d\'envoi d\'un email sans destinataire.');
      return;
    }

    const mailOptions = {
      from: this.fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // Non-blocking dispatch
    Promise.resolve().then(async () => {
      try {
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`[MailService] Email "${options.subject}" envoyé avec succès à ${options.to}`);
      } catch (error) {
        this.logger.error(
          `[MailService] Échec de l'envoi de l'email à ${options.to} (Erreur SMTP interceptée) :`,
          error instanceof Error ? error.message : error,
        );
      }
    });
  }
}
