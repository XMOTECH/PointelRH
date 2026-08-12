import { PrismaService } from '../../prisma/prisma.service';
export declare class AdvanceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(employeeId: string, amount: number, type: string, reason?: string): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        type: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string | null;
        repaid: boolean;
    }>;
    findAllForEmployee(employeeId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        type: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string | null;
        repaid: boolean;
    }[]>;
    findAll(companyId: string): Promise<({
        employee: {
            department: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        type: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string | null;
        repaid: boolean;
    })[]>;
    updateStatus(id: string, status: string): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        type: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string | null;
        repaid: boolean;
    }>;
}
