import { PrismaService } from '../../../prisma/prisma.service';
import { PlanningComplianceService, ComplianceViolation } from './planning-compliance.service';
import { CreateShiftDto, UpdateShiftDto, MoveShiftDto } from '../dto';
export declare class WorkShiftService {
    private readonly prisma;
    private readonly complianceService;
    constructor(prisma: PrismaService, complianceService: PlanningComplianceService);
    create(companyId: string, dto: CreateShiftDto, userId: string): Promise<{
        shift: {
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
            } | null;
            template: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                startTime: string;
                endTime: string;
                departmentId: string | null;
                jobTitle: string | null;
                color: string | null;
                breakMinutes: number;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string;
            endTime: string;
            departmentId: string | null;
            status: string;
            jobTitle: string | null;
            color: string | null;
            employeeId: string | null;
            planningWeekId: string | null;
            templateId: string | null;
            date: Date;
            breakMinutes: number;
            notes: string | null;
            isUnassigned: boolean;
        };
        violations: ComplianceViolation[];
    }>;
    update(companyId: string, id: string, dto: UpdateShiftDto, userId: string): Promise<{
        shift: {
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
            } | null;
            template: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                startTime: string;
                endTime: string;
                departmentId: string | null;
                jobTitle: string | null;
                color: string | null;
                breakMinutes: number;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string;
            endTime: string;
            departmentId: string | null;
            status: string;
            jobTitle: string | null;
            color: string | null;
            employeeId: string | null;
            planningWeekId: string | null;
            templateId: string | null;
            date: Date;
            breakMinutes: number;
            notes: string | null;
            isUnassigned: boolean;
        };
        violations: ComplianceViolation[];
    }>;
    move(companyId: string, id: string, dto: MoveShiftDto, userId: string): Promise<{
        shift: {
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
            } | null;
            template: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                startTime: string;
                endTime: string;
                departmentId: string | null;
                jobTitle: string | null;
                color: string | null;
                breakMinutes: number;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            startTime: string;
            endTime: string;
            departmentId: string | null;
            status: string;
            jobTitle: string | null;
            color: string | null;
            employeeId: string | null;
            planningWeekId: string | null;
            templateId: string | null;
            date: Date;
            breakMinutes: number;
            notes: string | null;
            isUnassigned: boolean;
        };
        violations: ComplianceViolation[];
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
