import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { buildWelcomeEmployeeEmail } from './templates/welcome-employee.template';
import { buildKioskPinEmail } from './templates/kiosk-pin.template';
import { buildOnboardingMagicLinkEmail } from './templates/onboarding-magic-link.template';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  @OnEvent('employee.created')
  async handleEmployeeCreated(payload: { employee: any; password?: string }) {
    if (!payload?.employee?.email) return;

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:5180');
    const { subject, text, html } = buildWelcomeEmployeeEmail({
      firstName: payload.employee.firstName,
      lastName: payload.employee.lastName,
      email: payload.employee.email,
      password: payload.password,
      loginUrl: frontendUrl,
    });

    await this.mailService.sendMail({
      to: payload.employee.email,
      subject,
      text,
      html,
    });
  }

  @OnEvent('employee.pin_generated')
  async handlePinGenerated(payload: { employee: any; pinCode: string }) {
    if (!payload?.employee?.email) return;

    const { subject, text, html } = buildKioskPinEmail({
      firstName: payload.employee.firstName,
      lastName: payload.employee.lastName,
      pinCode: payload.pinCode,
    });

    await this.mailService.sendMail({
      to: payload.employee.email,
      subject,
      text,
      html,
    });
  }

  @OnEvent('late.arrival')
  async handleLateArrival(payload: { employeeName: string; managerEmail: string; lateMinutes: number; clockInTime: Date }) {
    this.logger.log(
      `[NotificationListener] Alerte Retard pour ${payload.employeeName} (${payload.lateMinutes} min) signalée au manager ${payload.managerEmail}`,
    );
  }

  @OnEvent('onboarding.session.created')
  async handleOnboardingSessionCreated(payload: {
    sessionId: string;
    companyId: string;
    candidateEmail: string;
    candidatePhone: string;
    magicToken: string;
    targetStartDate: Date;
    candidateName?: string;
  }) {
    if (!payload?.candidateEmail || !payload?.magicToken) return;

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:5180');
    const portalUrl = `${frontendUrl.replace(/\/$/, '')}/onboarding/portal/${payload.magicToken}`;

    const { subject, text, html } = buildOnboardingMagicLinkEmail({
      candidateName: payload.candidateName,
      portalUrl,
    });

    await this.mailService.sendMail({
      to: payload.candidateEmail,
      subject,
      text,
      html,
    });
  }
}
