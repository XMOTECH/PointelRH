import { AdvanceService } from './advance.service';
import { CurrentUserDto } from '../../common/decorators/current-user.decorator';
export declare class AdvanceController {
    private readonly advanceService;
    constructor(advanceService: AdvanceService);
    createMyAdvance(user: CurrentUserDto, body: {
        amount: number;
        type: string;
        reason?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
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
                isCadre: boolean;
                jobTitle: string | null;
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
        };
    }>;
    getMyAdvances(user: CurrentUserDto): Promise<{
        success: boolean;
        data: {
            amount: number;
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
                isCadre: boolean;
                jobTitle: string | null;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            employeeId: string;
            type: string;
            reason: string | null;
            repaid: boolean;
        }[];
    }>;
    getAllAdvances(companyId: string): Promise<{
        success: boolean;
        data: {
            amount: number;
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
                isCadre: boolean;
                jobTitle: string | null;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            employeeId: string;
            type: string;
            reason: string | null;
            repaid: boolean;
        }[];
    }>;
    updateAdvanceStatus(companyId: string, id: string, body: {
        status: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
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
                isCadre: boolean;
                jobTitle: string | null;
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
        };
    }>;
}
