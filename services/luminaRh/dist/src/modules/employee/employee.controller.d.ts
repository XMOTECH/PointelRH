import type { Response } from 'express';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from '../../prisma/prisma.service';
export declare class EmployeeController {
    private readonly employeeService;
    private readonly prisma;
    constructor(employeeService: EmployeeService, prisma: PrismaService);
    create(companyId: string, createEmployeeDto: CreateEmployeeDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    findAll(companyId: string, departmentId?: string, status?: string, contractType?: string, role?: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    update(companyId: string, id: string, updateDto: UpdateEmployeeDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getFaceEnrollment(id: string): Promise<{
        success: boolean;
        data: {
            enrolled: boolean;
            count: number;
            labels: string[];
        };
    }>;
    enrollFace(id: string, body: {
        descriptors: number[][];
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteFaceEnrollment(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    generatePin(companyId: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    getWorkCertificate(companyId: string, id: string, res: Response): Promise<void>;
    getSoldeDeToutCompte(companyId: string, id: string, res: Response): Promise<void>;
}
