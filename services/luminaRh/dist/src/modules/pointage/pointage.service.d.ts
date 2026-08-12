import { OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
export declare class PointageService implements OnModuleInit {
    private readonly prisma;
    private readonly eventEmitter;
    private faceDescriptorsCache;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    onModuleInit(): Promise<void>;
    refreshFaceCache(): Promise<void>;
    handleFaceRegistered(payload: {
        employeeId: string;
    }): Promise<void>;
    handleFaceDeleted(payload: {
        employeeId: string;
    }): Promise<void>;
    clockIn(companyId: string, dto: ClockInDto): Promise<{
        employee: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            email: string;
            departmentId: string;
            userId: string;
            scheduleId: string | null;
            firstName: string;
            lastName: string;
            pinCode: string | null;
            contractType: string;
            hireDate: Date;
            status: string;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            transportAllowance: import("@prisma/client/runtime/library").Decimal;
            maritalStatus: string;
            taxParts: number;
        };
        location: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            address: string | null;
            latitude: number;
            longitude: number;
            radius: number;
            qrToken: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        employeeId: string;
        locationId: string | null;
        clockIn: Date;
        clockOut: Date | null;
        deviceType: string;
        ipAddress: string | null;
        isLate: boolean;
        lateMinutes: number;
    }>;
    clockOut(employeeId: string, dto: ClockOutDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        employeeId: string;
        locationId: string | null;
        clockIn: Date;
        clockOut: Date | null;
        deviceType: string;
        ipAddress: string | null;
        isLate: boolean;
        lateMinutes: number;
    }>;
    getTodayStatus(employeeId: string): Promise<({
        location: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            address: string | null;
            latitude: number;
            longitude: number;
            radius: number;
            qrToken: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        employeeId: string;
        locationId: string | null;
        clockIn: Date;
        clockOut: Date | null;
        deviceType: string;
        ipAddress: string | null;
        isLate: boolean;
        lateMinutes: number;
    }) | null>;
    getHistory(companyId: string, filters: {
        departmentId?: string;
        locationId?: string;
        date?: string;
    }): Promise<({
        employee: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            email: string;
            departmentId: string;
            userId: string;
            scheduleId: string | null;
            firstName: string;
            lastName: string;
            pinCode: string | null;
            contractType: string;
            hireDate: Date;
            status: string;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            transportAllowance: import("@prisma/client/runtime/library").Decimal;
            maritalStatus: string;
            taxParts: number;
        };
        location: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            address: string | null;
            latitude: number;
            longitude: number;
            radius: number;
            qrToken: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        employeeId: string;
        locationId: string | null;
        clockIn: Date;
        clockOut: Date | null;
        deviceType: string;
        ipAddress: string | null;
        isLate: boolean;
        lateMinutes: number;
    })[]>;
    getByEmployeeIds(companyId: string, employeeIds: string[]): Promise<({
        employee: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            email: string;
            departmentId: string;
            userId: string;
            scheduleId: string | null;
            firstName: string;
            lastName: string;
            pinCode: string | null;
            contractType: string;
            hireDate: Date;
            status: string;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            transportAllowance: import("@prisma/client/runtime/library").Decimal;
            maritalStatus: string;
            taxParts: number;
        };
        location: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            address: string | null;
            latitude: number;
            longitude: number;
            radius: number;
            qrToken: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        employeeId: string;
        locationId: string | null;
        clockIn: Date;
        clockOut: Date | null;
        deviceType: string;
        ipAddress: string | null;
        isLate: boolean;
        lateMinutes: number;
    })[]>;
    private calculateLateness;
    private getDistance;
}
