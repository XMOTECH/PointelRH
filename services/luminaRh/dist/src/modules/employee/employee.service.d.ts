import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
export declare class EmployeeService {
    private readonly prisma;
    private readonly eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(companyId: string, dto: CreateEmployeeDto): Promise<{
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
        };
        schedule: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string | null;
            endTime: string | null;
            graceMinutes: number;
        } | null;
    } & {
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
    }>;
    list(companyId: string, filters: {
        departmentId?: string;
        status?: string;
        contractType?: string;
        role?: string;
    }): Promise<({
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
        };
        schedule: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string | null;
            endTime: string | null;
            graceMinutes: number;
        } | null;
        user: {
            isActive: boolean;
            role: string;
        };
    } & {
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
    })[]>;
    findOne(companyId: string, id: string): Promise<{
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
        };
        schedule: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string | null;
            endTime: string | null;
            graceMinutes: number;
        } | null;
        user: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            email: string;
            password: string;
            role: string;
            googleId: string | null;
            departmentId: string | null;
        };
    } & {
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
    }>;
    update(companyId: string, id: string, dto: Partial<CreateEmployeeDto> & {
        status?: string;
    }): Promise<{
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
        };
        schedule: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string | null;
            endTime: string | null;
            graceMinutes: number;
        } | null;
    } & {
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
    }>;
    remove(companyId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    getFaceEnrollment(employeeId: string): Promise<{
        enrolled: boolean;
        count: number;
        labels: string[];
    }>;
    enrollFace(employeeId: string, descriptors: any[]): Promise<void>;
    deleteFaceEnrollment(employeeId: string): Promise<void>;
    generatePin(companyId: string, employeeId: string): Promise<{
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
        };
        schedule: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string | null;
            endTime: string | null;
            graceMinutes: number;
        } | null;
    } & {
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
    }>;
}
