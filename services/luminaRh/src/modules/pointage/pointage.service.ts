import { Injectable, NotFoundException, ConflictException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';

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
        } catch (e) {
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

  async clockIn(companyId: string, dto: ClockInDto) {
    let employee = null;

    // 1. Resolve employee based on channel
    if (dto.channel === 'pin') {
      const pin = dto.payload.pin;
      if (!pin) throw new BadRequestException('Code PIN manquant');
      
      employee = await this.prisma.employee.findFirst({
        where: { pinCode: pin, companyId },
        include: { schedule: true },
      });
    } else if (dto.channel === 'qr') {
      const token = dto.payload.token;
      if (!token) throw new BadRequestException('Token QR manquant');

      // Check if token represents a location's qrToken
      const location = await this.prisma.location.findFirst({
        where: { qrToken: token, companyId },
      });

      if (!location) {
        throw new NotFoundException('Token de site invalide');
      }

      // Resolve employee by email from payload (the app generates the QR containing location token + signed employee id)
      const employeeId = dto.payload.employeeId;
      if (!employeeId) throw new BadRequestException('ID employé manquant');

      employee = await this.prisma.employee.findFirst({
        where: { id: employeeId, companyId },
        include: { schedule: true },
      });
    } else if (dto.channel === 'web') {
      const userId = dto.payload?.userId || dto.payload?.user_id;
      if (!userId) throw new BadRequestException('Identifiant utilisateur manquant');

      employee = await this.prisma.employee.findUnique({
        where: { userId },
        include: { schedule: true },
      });
    } else if (dto.channel === 'face') {
      const inputDescriptor = dto.payload?.descriptor;
      if (!inputDescriptor || !Array.isArray(inputDescriptor)) {
        throw new BadRequestException('Descripteur facial manquant ou invalide');
      }

      let bestEmployee = null;
      let minDistance = 999.0;
      const threshold = 0.55; // Common Face-API distance threshold

      // Search in RAM cache instead of querying the database and parsing JSON synchrously in the loop
      for (const item of this.faceDescriptorsCache) {
        // If query is company-scoped, ensure employee belongs to company
        if (companyId && item.employee.companyId !== companyId) {
          continue;
        }

        const dbDesc = item.descriptor;
        if (dbDesc.length === inputDescriptor.length) {
          // Optimized Euclidean distance computation using simple fast loops on Float/Number arrays
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

      if (bestEmployee && minDistance < threshold) {
        employee = bestEmployee;
      } else {
        throw new NotFoundException('Aucune correspondance faciale trouvée');
      }
    }

    if (!employee) {
      throw new NotFoundException('Employé introuvable');
    }

    // Resolve final companyId from employee if query/payload did not have it
    const resolvedCompanyId = companyId || employee.companyId;

    // 2. Verify schedule exists
    if (!employee.schedule) {
      throw new BadRequestException('Aucun planning assigné à cet employé. Veuillez contacter votre responsable.');
    }

    // 3. Verify uniqueness (only one clock-in per day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        clockIn: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (existingAttendance) {
      throw new ConflictException({
        statusCode: 409,
        message: 'L\'employé a déjà pointé aujourd\'hui',
        employee_id: employee.id,
        employeeId: employee.id,
      });
    }

    // 4. Calculate lateness
    const now = new Date();
    const lateMinutes = this.calculateLateness(now, employee.schedule.name); // Using simple default shift parser

    // 5. Geofencing check
    let isWithinZone = true;
    let locationId = employee.departmentId; // Fallback or direct location

    // Resolve location
    const location = await this.prisma.location.findFirst({
      where: { companyId: resolvedCompanyId }, // Or find location by id
    });

    if (location && dto.latitude && dto.longitude) {
      locationId = location.id;
      const distance = this.getDistance(
        dto.latitude,
        dto.longitude,
        location.latitude,
        location.longitude,
      );
      isWithinZone = distance <= location.radius;
    }

    // 6. Create attendance log
    const attendanceRecord = await this.prisma.attendance.create({
      data: {
        employeeId: employee.id,
        locationId: location ? location.id : null,
        clockIn: now,
        deviceType: dto.channel === 'pin' ? 'kiosk' : (dto.channel === 'web' ? 'web' : 'mobile'),
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

    this.eventEmitter.emit('attendance.recorded', { companyId: resolvedCompanyId });

    return attendanceRecord;
  }


  async clockOut(employeeId: string, dto: ClockOutDto) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Find active clock-in for today
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        clockIn: {
          gte: todayStart,
          lte: todayEnd,
        },
        clockOut: null,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Aucun pointage d\'entrée actif trouvé pour aujourd\'hui');
    }

    const updatedRecord = await this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: new Date(),
      },
    });

    const emp = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { companyId: true },
    });
    if (emp) {
      this.eventEmitter.emit('attendance.recorded', { companyId: emp.companyId });
    }

    return updatedRecord;
  }

  async getTodayStatus(employeeId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return this.prisma.attendance.findFirst({
      where: {
        employeeId,
        clockIn: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        location: true,
      },
    });
  }

  async getHistory(companyId: string, filters: { departmentId?: string; locationId?: string; date?: string }) {
    const searchDate = filters.date ? new Date(filters.date) : new Date();
    const start = new Date(searchDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(searchDate);
    end.setHours(23, 59, 59, 999);

    return this.prisma.attendance.findMany({
      where: {
        employee: {
          companyId,
          departmentId: filters.departmentId,
        },
        locationId: filters.locationId,
        clockIn: {
          gte: start,
          lte: end,
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
  }

  async getByEmployeeIds(companyId: string, employeeIds: string[]) {
    return this.prisma.attendance.findMany({
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
  }

  // --- HELPER METHODS ---

  private calculateLateness(now: Date, scheduleName: string): number {
    // Basic schedule parser: Assumes scheduleName contains start time like "08:00"
    const match = scheduleName.match(/(\d{2}):(\d{2})/);
    if (!match) return 0; // On time if schedule format is custom

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    const checkTime = new Date(now);
    checkTime.setHours(hours, minutes, 0, 0);

    if (now.getTime() <= checkTime.getTime()) {
      return 0; // On time
    }

    // Difference in minutes
    return Math.floor((now.getTime() - checkTime.getTime()) / 60000);
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
