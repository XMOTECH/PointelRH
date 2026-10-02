import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
// @ts-ignore
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const smtpHost = this.config.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const smtpPort = Number(this.config.get('SMTP_PORT', 587));
    const smtpSecure = this.config.get('SMTP_SECURE') === 'true' || this.config.get('SMTP_SECURE') === true;
    const rawUser = this.config.get<string>('SMTP_USER', '');
    const rawPass = this.config.get<string>('SMTP_PASS', '');
    const smtpUser = rawUser ? rawUser.replace(/^["']|["']$/g, '').trim() : undefined;
    const smtpPass = rawPass ? rawPass.replace(/^["']|["']$/g, '').replace(/\s+/g, '').trim() : undefined;

    if (!smtpUser || !smtpPass) {
      this.logger.warn('[SMTP] SMTP_USER ou SMTP_PASS non configuré. Les emails seront désactivés.');
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      requireTLS: !smtpSecure,
      auth: (smtpUser && smtpPass) ? {
        user: smtpUser,
        pass: smtpPass,
      } : undefined,
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  @OnEvent('employee.created')
  async handleEmployeeCreated(payload: { employee: any; password?: string }) {
    if (!payload?.employee?.email) return;

    this.logger.log(`[Notification] Envoi des identifiants de connexion par email à : ${payload.employee.email}`);
    
    const smtpFrom = this.config.get<string>('SMTP_FROM', 'LuminaRH <noreply@luminarh.sn>');
    
    const mailOptions = {
      from: smtpFrom,
      to: payload.employee.email,
      subject: 'Activation de votre compte LuminaRH',
      text: `Bonjour ${payload.employee.firstName} ${payload.employee.lastName},\n\nVotre compte LuminaRH a été créé.\n\nIdentifiants :\nEmail: ${payload.employee.email}\nMot de passe temporaire: ${payload.password}\n\nConnectez-vous sur http://localhost:5180 pour l'activer.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
          <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #edf2f7; padding-bottom: 16px;">
            <h2 style="color: #0041c8; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">Lumina<span style="color: #3182ce;">RH</span></h2>
            <span style="font-size: 11px; color: #a0aec0; text-transform: uppercase; tracking-wider: 0.05em; font-weight: 700;">Plateforme de Gestion des Ressources Humaines</span>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Bonjour <strong>${payload.employee.firstName} ${payload.employee.lastName}</strong>,</p>
          
          <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 20px;">Votre compte a été créé avec succès sur la plateforme <strong>LuminaRH</strong> par votre administrateur.</p>
          
          <div style="background-color: #f7fafc; border-left: 4px solid #0041c8; padding: 18px; margin: 24px 0; border-radius: 6px; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);">
            <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #2d3748; text-transform: uppercase; letter-spacing: 0.05em;">Vos identifiants de connexion :</p>
            <p style="margin: 0 0 8px 0; font-size: 15px; color: #4a5568;"><strong>Email :</strong> ${payload.employee.email}</p>
            <p style="margin: 0; font-size: 15px; color: #4a5568;"><strong>Mot de passe temporaire :</strong> <code style="background-color: #edf2f7; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-family: monospace; color: #2d3748; font-size: 14px;">${payload.password}</code></p>
          </div>
          
          <div style="background-color: #ebf8ff; border: 1px solid #bee3f8; color: #2b6cb0; padding: 12px 16px; margin: 20px 0; border-radius: 6px; font-size: 14px;">
            ℹ️ Lors de votre première connexion, il vous sera demandé de modifier ce mot de passe temporaire.
          </div>
          
          <div style="text-align: center; margin: 32px 0 24px 0;">
            <a href="http://localhost:5180" style="background-color: #0041c8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 65, 200, 0.2), 0 2px 4px -1px rgba(0, 65, 200, 0.1);">Activer mon compte</a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 32px 0 24px 0;" />
          
          <p style="font-size: 11px; color: #a0aec0; text-align: center; margin: 0; line-height: 1.5;">Cet email a été envoyé automatiquement par LuminaRH.<br />Merci de ne pas y répondre.</p>
        </div>
      `,
    };

    // Exécution de l'envoi dans un bloc try/catch asynchrone non-bloquant
    Promise.resolve().then(async () => {
      try {
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`[Notification] Email d'activation envoyé avec succès à ${payload.employee.email}`);
      } catch (error) {
        this.logger.error(`[Notification] Échec d'envoi de l'email à ${payload.employee.email} (Erreur SMTP ignorée pour ne pas bloquer l'API) :`, error);
      }
    });
  }

  @OnEvent('employee.pin_generated')
  async handlePinGenerated(payload: { employee: any; pinCode: string }) {
    if (!payload?.employee?.email) return;

    this.logger.log(`[Notification] Envoi du nouveau code PIN par email à : ${payload.employee.email}`);
    
    const smtpFrom = this.config.get<string>('SMTP_FROM', 'LuminaRH <noreply@luminarh.sn>');
    
    const mailOptions = {
      from: smtpFrom,
      to: payload.employee.email,
      subject: 'Votre nouveau code PIN de pointage - LuminaRH',
      text: `Bonjour ${payload.employee.firstName} ${payload.employee.lastName},\n\nUn nouveau code PIN de pointage vous a été attribué.\n\nVotre code PIN kiosque : ${payload.pinCode}\n\nVous pouvez désormais utiliser ce code à 4 chiffres sur les tablettes et bornes de pointage kiosque.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
          <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #edf2f7; padding-bottom: 16px;">
            <h2 style="color: #0041c8; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">Lumina<span style="color: #3182ce;">RH</span></h2>
            <span style="font-size: 11px; color: #a0aec0; text-transform: uppercase; font-weight: 700;">Plateforme RH & Pointage</span>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Bonjour <strong>${payload.employee.firstName} ${payload.employee.lastName}</strong>,</p>
          
          <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 20px;">Un nouveau code PIN individuel vous a été attribué par votre administrateur pour effectuer vos pointages sur les bornes Kiosque.</p>
          
          <div style="background-color: #f7fafc; border-left: 4px solid #0041c8; padding: 18px; margin: 24px 0; border-radius: 6px; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #718096; text-transform: uppercase;">VOTRE CODE PIN KIOSQUE :</p>
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0041c8; font-family: monospace;">${payload.pinCode}</span>
          </div>
          
          <p style="font-size: 13px; color: #718096; text-align: center;">Saisissez simplement ces 4 chiffres sur le pavé numérique du kiosque pour valider votre entrée ou votre sortie.</p>
        </div>
      `,
    };

    Promise.resolve().then(async () => {
      try {
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`[Notification] Email de code PIN envoyé avec succès à ${payload.employee.email}`);
      } catch (error) {
        this.logger.error(`[Notification] Échec d'envoi de l'email PIN à ${payload.employee.email} :`, error);
      }
    });
  }

  @OnEvent('late.arrival')
  async handleLateArrival(payload: { employeeName: string; managerEmail: string; lateMinutes: number; clockInTime: Date }) {
    this.logger.log(`[Notification] Alerte Retard envoyée à ${payload.managerEmail} pour l'employé ${payload.employeeName} (${payload.lateMinutes} min de retard)`);
  }

  async findAllForUser(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(n => this.mapToResource(n));
  }

  async markAsRead(userId: string, id: string) {
    await this.ensureOwned(userId, id);

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return this.mapToResource(updated);
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }

  async remove(userId: string, id: string) {
    await this.ensureOwned(userId, id);

    await this.prisma.notification.delete({
      where: { id },
    });

    return { success: true };
  }

  private async ensureOwned(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    return notification;
  }

  private mapToResource(n: { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: Date }) {
    return {
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      is_read: n.isRead,
      created_at: n.createdAt,
    };
  }
}
