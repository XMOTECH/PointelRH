import { Injectable, NotFoundException, ConflictException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { PunchDto } from './dto/punch.dto';

@Injectable()
export class PointageService implements OnModuleInit {
  private faceDescriptorsCache: Array<{
    employee: any;
    descriptor: number[];
  }> = [];
  private readonly logger = new Logger(PointageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    await this.refreshFaceCache();
  }

  async refreshFaceCache() {
    try {
      const allDescriptors = await this.prisma.faceDescriptor.findMany({
        where: {
          employee: {
            status: 'active',
          },
        },
        include: {
          employee: {
            include: { schedule: true },
          },
        },
      });

      const cache = [];
      for (const fd of allDescriptors) {
        try {
          const dbDesc = JSON.parse(fd.descriptor);
          if (Array.isArray(dbDesc)) {
            cache.push({
              employee: fd.employee,
              descriptor: dbDesc,
            });
          }
        } catch {
          // Skip malformed descriptors
        }
      }

      this.faceDescriptorsCache = cache;
      this.logger.log(`[PointageService] Loaded ${this.faceDescriptorsCache.length} face descriptors into RAM cache.`);
    } catch (err) {
      this.logger.error('[PointageService] Failed to load face descriptors cache:', err);
    }
  }

  @OnEvent('face.registered')
  async handleFaceRegistered(payload: { employeeId: string }) {
    this.logger.log(`[PointageService] Invalidation of face cache due to new registration for employee ${payload.employeeId}`);
    await this.refreshFaceCache();
  }

  @OnEvent('face.deleted')
  async handleFaceDeleted(payload: { employeeId: string }) {
    this.logger.log(`[PointageService] Invalidation of face cache due to deletion for employee ${payload.employeeId}`);
    await this.refreshFaceCache();
  }

  /**
   * Résout l'employé à partir des différents canaux (PIN, Face, QR, Web)
   */
  async resolveEmployee(
    dto: { channel: string; payload?: any; companyId?: string; company_id?: string },
    explicitCompanyId?: string,
  ): Promise<any> {
    const companyId = explicitCompanyId || dto.companyId || dto.company_id || dto.payload?.companyId || dto.payload?.company_id;
    let employee: any = null;

    if (dto.channel === 'pin') {
      const pin = dto.payload?.pin || dto.payload?.pin_code || dto.payload?.pinCode;
      if (!pin) throw new BadRequestException('Code PIN manquant');

      if (companyId) {
        employee = await this.prisma.employee.findFirst({
          where: { pinCode: String(pin), companyId, status: 'active' },
          include: { schedule: true },
        });
      } else {
        const matching = (await this.prisma.employee.findMany({
          where: { pinCode: String(pin), status: 'active' },
          include: { schedule: true },
        })) || [];
        if (matching.length > 1) {
          throw new BadRequestException("Plusieurs collaborateurs partagent ce PIN sur des entreprises différentes. Veuillez spécifier l'identifiant de l'entreprise.");
        }
        employee = matching[0] || null;
      }
    } else if (dto.channel === 'qr') {
      const token = dto.payload?.token;
      if (!token) throw new BadRequestException('Token QR manquant');

      const location = await this.prisma.location.findFirst({
        where: { qrToken: token, ...(companyId ? { companyId } : {}) },
      });

      if (!location) {
        throw new NotFoundException('Token de site QR invalide');
      }

      const employeeId = dto.payload?.employeeId || dto.payload?.employee_id;
      if (!employeeId) throw new BadRequestException('ID employé manquant pour le QR code');

      employee = await this.prisma.employee.findFirst({
        where: { id: employeeId, companyId: location.companyId },
        include: { schedule: true },
      });
    } else if (dto.channel === 'web') {
      const userId = dto.payload?.userId || dto.payload?.user_id || dto.payload?.employeeId || dto.payload?.employee_id;
      const email = dto.payload?.email;

      if (!userId && !email) {
        throw new BadRequestException('Identifiant utilisateur ou email manquant');
      }

      employee = await this.prisma.employee.findFirst({
        where: {
          OR: [
            ...(userId ? [{ userId }, { id: userId }] : []),
            ...(email ? [{ email }] : []),
          ],
          ...(companyId ? { companyId } : {}),
        },
        include: { schedule: true },
      });
    } else if (dto.channel === 'face') {
      const inputDescriptor = dto.payload?.descriptor;
      if (!inputDescriptor || !Array.isArray(inputDescriptor)) {
        throw new BadRequestException('Descripteur facial manquant ou invalide');
      }

      let bestEmployee = null;
      let minDistance = 999.0;
      const threshold = 0.55;

      const startTime = performance.now();

      for (const item of this.faceDescriptorsCache) {
        if (companyId && item.employee.companyId !== companyId) {
          continue;
        }

        const dbDesc = item.descriptor;
        if (dbDesc.length === inputDescriptor.length) {
          let sum = 0;
          for (let i = 0; i < dbDesc.length; i++) {
            const diff = dbDesc[i] - inputDescriptor[i];
            sum += diff * diff;
          }
          const distance = Math.sqrt(sum);
          if (distance < minDistance) {
            minDistance = distance;
            bestEmployee = item.employee;
          }
        }
      }

      const durationMs = (performance.now() - startTime).toFixed(2);

      if (bestEmployee && minDistance < threshold) {
        this.logger.log(
          `[FaceRecognition] ✅ Identifié: ${bestEmployee.firstName} ${bestEmployee.lastName} (Distance: ${minDistance.toFixed(4)} < Seuil: ${threshold}) en ${durationMs} ms`
        );
        employee = bestEmployee;
      } else {
        this.logger.warn(
          `[FaceRecognition] ❌ Échec: distance minimale ${minDistance.toFixed(4)} supérieure au seuil ${threshold}`
        );
        throw new NotFoundException('Aucune correspondance faciale trouvée');
      }
    }

    if (!employee) {
      throw new NotFoundException('Collaborateur introuvable ou inactif');
    }

    return employee;
  }

  /**
   * Enregistre un pointage d'entrée (Clock In)
   * Supporte le multi-session : si la session précédente est terminée, permet d'en ouvrir une nouvelle.
   */
  async clockIn(companyId: string | undefined, dto: ClockInDto) {
    const employee = await this.resolveEmployee(dto, companyId);
    const resolvedCompanyId = companyId || dto.companyId || dto.company_id || employee.companyId;

    // 1. Vérification planning (priorité Shift dynamique du jour, sinon Schedule par défaut)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayShift = await this.prisma.shift.findFirst({
      where: {
        employeeId: employee.id,
        date: { gte: todayStart, lte: todayEnd },
        status: { in: ['PUBLISHED', 'CONFIRMED', 'DRAFT'] },
      },
    });

    if (!todayShift && !employee.schedule) {
      throw new BadRequestException('Aucun planning assigné à cet employé. Veuillez contacter votre responsable.');
    }

    // 2. Vérification d'absence de session active non clôturée dans les 24h glissantes
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeSession = await this.prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        clockIn: { gte: twentyFourHoursAgo },
        clockOut: null,
      },
      orderBy: { clockIn: 'desc' },
    });

    if (activeSession) {
      const timeStr = activeSession.clockIn.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      throw new ConflictException({
        statusCode: 409,
        message: `Une session active est déjà ouverte depuis ${timeStr}. Veuillez clôturer votre départ d'abord.`,
        employee_id: employee.id,
        employeeId: employee.id,
        activeSessionId: activeSession.id,
      });
    }

    // 3. Calcul du retard
    // S'il s'agit d'une reprise de session dans la même journée (ex: retour de pause déjeuner),
    // on ne sanctionne pas l'arrivée par rapport à l'horaire du matin.
    const priorSessionsTodayCount = await this.prisma.attendance.count({
      where: {
        employeeId: employee.id,
        clockIn: { gte: todayStart, lte: todayEnd },
      },
    });

    const now = new Date();
    let lateMinutes = 0;

    if (priorSessionsTodayCount === 0) {
      const scheduleConfig = todayShift
        ? { startTime: todayShift.startTime, graceMinutes: employee.schedule?.graceMinutes ?? 15 }
        : employee.schedule;

      lateMinutes = this.calculateLateness(now, scheduleConfig);
    }

    // 4. Géofencing multi-sites
    let matchedLocationId: string | null = null;

    if (dto.channel === 'qr' && dto.payload?.token) {
      const qrLocation = await this.prisma.location.findFirst({
        where: { qrToken: dto.payload.token, companyId: resolvedCompanyId },
      });
      if (qrLocation) matchedLocationId = qrLocation.id;
    }

    if (dto.latitude && dto.longitude) {
      const locations = await this.prisma.location.findMany({
        where: { companyId: resolvedCompanyId, isActive: true },
      });

      if (locations.length > 0) {
        let closestLocation: any = null;
        let minDistance = Infinity;

        for (const loc of locations) {
          const dist = this.getDistance(dto.latitude, dto.longitude, loc.latitude, loc.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            closestLocation = loc;
          }
        }

        if (closestLocation) {
          const allowedRadius = closestLocation.radius || 100;
          if (minDistance <= allowedRadius) {
            matchedLocationId = closestLocation.id;
          } else {
            throw new BadRequestException(
              `Pointage refusé : vous êtes en dehors de la zone autorisée (${Math.round(minDistance)}m du site "${closestLocation.name}", rayon autorisé : ${allowedRadius}m).`
            );
          }
        }
      }
    }

    // 5. Création de l'enregistrement de pointage
    const attendanceRecord = await this.prisma.attendance.create({
      data: {
        employeeId: employee.id,
        locationId: matchedLocationId,
        clockIn: now,
        deviceType: dto.channel === 'pin' || dto.channel === 'face' ? 'kiosk' : (dto.channel === 'web' ? 'web' : 'mobile'),
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
        isLate: lateMinutes > 0,
        lateMinutes: lateMinutes,
      },
      include: {
        employee: true,
        location: true,
      },
    });

    this.eventEmitter.emit('attendance.recorded', { companyId: resolvedCompanyId, employeeId: employee.id });

    return {
      ...attendanceRecord,
      clock_in: attendanceRecord.clockIn,
      clock_out: attendanceRecord.clockOut,
      checked_in_at: attendanceRecord.clockIn,
      checked_out_at: attendanceRecord.clockOut,
    };
  }

  /**
   * Enregistre un pointage de sortie (Clock Out)
   * Clôture la dernière session active ouverte (jusqu'à 24h en arrière pour shifts de nuit).
   */
  async clockOut(employeeId: string, dto?: ClockOutDto) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        OR: [
          { employeeId },
          { employee: { userId: employeeId } },
          { employee: { email: employeeId } },
        ],
        clockIn: { gte: twentyFourHoursAgo },
        clockOut: null,
      },
      orderBy: { clockIn: 'desc' },
      include: {
        employee: true,
        location: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException("Aucun pointage d'arrivée actif trouvé à clôturer.");
    }

    const now = new Date();
    const workMinutes = Math.max(0, Math.floor((now.getTime() - attendance.clockIn.getTime()) / 60000));

    const updatedRecord = await this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: now,
      },
      include: {
        employee: true,
        location: true,
      },
    });

    if (attendance.employee?.companyId) {
      this.eventEmitter.emit('attendance.recorded', { companyId: attendance.employee.companyId, employeeId: attendance.employeeId });
    }

    return {
      ...updatedRecord,
      clock_in: updatedRecord.clockIn,
      clock_out: updatedRecord.clockOut,
      checked_in_at: updatedRecord.clockIn,
      checked_out_at: updatedRecord.clockOut,
      work_minutes: workMinutes,
      workMinutes: workMinutes,
    };
  }

  /**
   * Smart Punch / Toggle universel
   * Détecte automatiquement l'action requise (Entrée ou Sortie) sans provoquer d'erreur 409.
   */
  async punch(dto: PunchDto, explicitCompanyId?: string) {
    const employee = await this.resolveEmployee(dto, explicitCompanyId);
    const resolvedCompanyId = explicitCompanyId || dto.companyId || dto.company_id || employee.companyId;

    const action = dto.action || 'auto';

    if (action === 'in') {
      const attendance = await this.clockIn(resolvedCompanyId, {
        channel: dto.channel,
        payload: dto.payload,
        latitude: dto.latitude,
        longitude: dto.longitude,
        companyId: resolvedCompanyId,
      });
      const timeStr = attendance.clockIn.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return {
        action: 'CLOCK_IN',
        attendance,
        message: `Bonjour ${employee.firstName}, votre arrivée a été enregistrée à ${timeStr}.`,
      };
    }

    if (action === 'out') {
      const attendance = await this.clockOut(employee.id, {
        employee_id: employee.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });
      const timeStr = attendance.clockOut ? attendance.clockOut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
      return {
        action: 'CLOCK_OUT',
        attendance,
        message: `Au revoir ${employee.firstName}, votre départ a été enregistré à ${timeStr}.`,
      };
    }

    // Mode AUTO (Smart Toggle)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeSession = await this.prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        clockIn: { gte: twentyFourHoursAgo },
        clockOut: null,
      },
      orderBy: { clockIn: 'desc' },
    });

    if (activeSession) {
      // Une session est ouverte -> on pointe la sortie
      const attendance = await this.clockOut(employee.id, {
        employee_id: employee.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });
      const timeStr = attendance.clockOut ? attendance.clockOut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
      return {
        action: 'CLOCK_OUT',
        attendance,
        message: `Au revoir ${employee.firstName}, votre départ a été enregistré à ${timeStr}.`,
      };
    } else {
      // Aucune session ouverte -> on pointe l'entrée
      const attendance = await this.clockIn(resolvedCompanyId, {
        channel: dto.channel,
        payload: dto.payload,
        latitude: dto.latitude,
        longitude: dto.longitude,
        companyId: resolvedCompanyId,
      });
      const timeStr = attendance.clockIn.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return {
        action: 'CLOCK_IN',
        attendance,
        message: `Bonjour ${employee.firstName}, votre arrivée a été enregistrée à ${timeStr}.`,
      };
    }
  }

  /**
   * Statut du jour pour un employé (avec multi-sessions et cumul des heures réelles)
   */
  async getTodayStatus(employeeId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.attendance.findMany({
      where: {
        AND: [
          {
            OR: [
              { employeeId },
              { employee: { userId: employeeId } },
              { employee: { email: employeeId } },
            ],
          },
          {
            OR: [
              { clockIn: { gte: todayStart, lte: todayEnd } },
              { clockIn: { gte: twentyFourHoursAgo }, clockOut: null },
            ],
          },
        ],
      },
      include: {
        location: true,
      },
      orderBy: {
        clockIn: 'asc',
      },
    });

    if (sessions.length === 0) {
      return null;
    }

    const now = new Date();
    let totalWorkMinutes = 0;
    for (const s of sessions) {
      if (s.clockOut) {
        totalWorkMinutes += Math.max(0, Math.floor((s.clockOut.getTime() - s.clockIn.getTime()) / 60000));
      } else {
        totalWorkMinutes += Math.max(0, Math.floor((now.getTime() - s.clockIn.getTime()) / 60000));
      }
    }

    const latest = sessions[sessions.length - 1];
    const hasActiveSession = latest.clockOut === null;

    return {
      ...latest,
      clock_in: latest.clockIn,
      clock_out: latest.clockOut,
      checked_in_at: latest.clockIn,
      checked_out_at: latest.clockOut,
      work_minutes: totalWorkMinutes,
      workMinutes: totalWorkMinutes,
      sessionsCount: sessions.length,
      hasActiveSession,
      activeSessionId: hasActiveSession ? latest.id : null,
      canClockIn: !hasActiveSession,
      canClockOut: hasActiveSession,
      sessions: sessions.map(s => ({
        id: s.id,
        clockIn: s.clockIn,
        clockOut: s.clockOut,
        isLate: s.isLate,
        lateMinutes: s.lateMinutes,
        durationMinutes: s.clockOut
          ? Math.max(0, Math.floor((s.clockOut.getTime() - s.clockIn.getTime()) / 60000))
          : Math.max(0, Math.floor((now.getTime() - s.clockIn.getTime()) / 60000)),
      })),
    };
  }

  async getHistory(companyId: string, filters: { departmentId?: string; locationId?: string; date?: string; employeeId?: string }) {
    let dateFilter = {};
    if (filters.date) {
      const searchDate = new Date(filters.date);
      const start = new Date(searchDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(searchDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = {
        clockIn: {
          gte: start,
          lte: end,
        },
      };
    }

    const attendances = await this.prisma.attendance.findMany({
      where: {
        employee: {
          companyId,
          ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
        },
        ...(filters.locationId ? { locationId: filters.locationId } : {}),
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...dateFilter,
      },
      include: {
        employee: true,
        location: true,
      },
      orderBy: {
        clockIn: 'desc',
      },
    });

    return attendances.map(a => ({
      ...a,
      clock_in: a.clockIn,
      clock_out: a.clockOut,
      checked_in_at: a.clockIn,
      checked_out_at: a.clockOut,
      work_minutes: a.clockOut ? Math.max(0, Math.floor((a.clockOut.getTime() - a.clockIn.getTime()) / 60000)) : null,
      workMinutes: a.clockOut ? Math.max(0, Math.floor((a.clockOut.getTime() - a.clockIn.getTime()) / 60000)) : null,
    }));
  }

  async getByEmployeeIds(companyId: string, employeeIds: string[]) {
    const attendances = await this.prisma.attendance.findMany({
      where: {
        employee: {
          id: { in: employeeIds },
          companyId,
        },
      },
      include: {
        employee: true,
        location: true,
      },
      orderBy: {
        clockIn: 'desc',
      },
    });

    return attendances.map(a => ({
      ...a,
      clock_in: a.clockIn,
      clock_out: a.clockOut,
      checked_in_at: a.clockIn,
      checked_out_at: a.clockOut,
      work_minutes: a.clockOut ? Math.max(0, Math.floor((a.clockOut.getTime() - a.clockIn.getTime()) / 60000)) : null,
      workMinutes: a.clockOut ? Math.max(0, Math.floor((a.clockOut.getTime() - a.clockIn.getTime()) / 60000)) : null,
    }));
  }

  // --- HELPER METHODS ---

  private calculateLateness(now: Date, schedule?: { startTime?: string | null; graceMinutes?: number; name?: string } | null): number {
    const startTimeStr = schedule?.startTime || schedule?.name || '08:00';
    const graceMins = schedule?.graceMinutes ?? 15;

    const match = startTimeStr.match(/(\d{2}):(\d{2})/);
    if (!match) return 0;

    const startHour = parseInt(match[1], 10);
    const startMin = parseInt(match[2], 10);

    const expectedTime = new Date(now);
    expectedTime.setHours(startHour, startMin, 0, 0);

    // Marge de tolérance (grace period)
    const maxAllowedTime = new Date(expectedTime.getTime() + graceMins * 60 * 1000);

    if (now.getTime() <= maxAllowedTime.getTime()) {
      return 0; // À l'heure !
    }

    // Calcul des minutes de retard écoulées depuis l'heure officielle d'embauche
    return Math.max(0, Math.floor((now.getTime() - expectedTime.getTime()) / 60000));
  }

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
