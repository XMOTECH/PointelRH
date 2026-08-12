"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    config;
    transporter;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const smtpHost = this.config.get('SMTP_HOST', 'smtp.gmail.com');
        const smtpPort = Number(this.config.get('SMTP_PORT', 587));
        const smtpSecure = this.config.get('SMTP_SECURE') === 'true' || this.config.get('SMTP_SECURE') === true;
        const rawUser = this.config.get('SMTP_USER', 'luminarhsn@gmail.com');
        const rawPass = this.config.get('SMTP_PASS', 'htlkmlnitskgeacs');
        const smtpUser = rawUser ? rawUser.replace(/^["']|["']$/g, '').trim() : 'luminarhsn@gmail.com';
        const smtpPass = rawPass ? rawPass.replace(/^["']|["']$/g, '').replace(/\s+/g, '').trim() : 'htlkmlnitskgeacs';
        this.logger.log(`[Diagnostic SMTP] Utilisateur: '${smtpUser}' (${smtpUser?.length} chars), Pass: '${smtpPass ? smtpPass.substring(0, 4) + '***' + smtpPass.substring(smtpPass.length - 4) : 'absent'}' (${smtpPass?.length} chars)`);
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
    async handleEmployeeCreated(payload) {
        if (!payload?.employee?.email)
            return;
        this.logger.log(`[Notification] Envoi des identifiants de connexion par email à : ${payload.employee.email}`);
        const smtpFrom = this.config.get('SMTP_FROM', 'LuminaRH <noreply@luminarh.sn>');
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
        Promise.resolve().then(async () => {
            try {
                await this.transporter.sendMail(mailOptions);
                this.logger.log(`[Notification] Email d'activation envoyé avec succès à ${payload.employee.email}`);
            }
            catch (error) {
                this.logger.error(`[Notification] Échec d'envoi de l'email à ${payload.employee.email} (Erreur SMTP ignorée pour ne pas bloquer l'API) :`, error);
            }
        });
    }
    async handlePinGenerated(payload) {
        if (!payload?.employee?.email)
            return;
        this.logger.log(`[Notification] Envoi du nouveau code PIN par email à : ${payload.employee.email}`);
        const smtpFrom = this.config.get('SMTP_FROM', 'LuminaRH <noreply@luminarh.sn>');
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
            }
            catch (error) {
                this.logger.error(`[Notification] Échec d'envoi de l'email PIN à ${payload.employee.email} :`, error);
            }
        });
    }
    async handleLateArrival(payload) {
        this.logger.log(`[Notification] Alerte Retard envoyée à ${payload.managerEmail} pour l'employé ${payload.employeeName} (${payload.lateMinutes} min de retard)`);
    }
    async findAllForUser(userId) {
        const notifications = await this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return notifications.map(n => this.mapToResource(n));
    }
    async markAsRead(userId, id) {
        await this.ensureOwned(userId, id);
        const updated = await this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        return this.mapToResource(updated);
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { success: true };
    }
    async remove(userId, id) {
        await this.ensureOwned(userId, id);
        await this.prisma.notification.delete({
            where: { id },
        });
        return { success: true };
    }
    async ensureOwned(userId, id) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification introuvable');
        }
        return notification;
    }
    mapToResource(n) {
        return {
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            is_read: n.isRead,
            created_at: n.createdAt,
        };
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, event_emitter_1.OnEvent)('employee.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleEmployeeCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('employee.pin_generated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handlePinGenerated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('late.arrival'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleLateArrival", null);
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map