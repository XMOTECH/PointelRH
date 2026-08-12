import { PointageService } from './pointage.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { CurrentUserDto } from '../../common/decorators/current-user.decorator';
export declare class PointageController {
    private readonly pointageService;
    constructor(pointageService: PointageService);
    clockIn(queryCompanyId: string, clockInDto: ClockInDto): Promise<{
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
        };
    }>;
    clockOut(user: CurrentUserDto, clockOutDto: ClockOutDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    getMyToday(user: CurrentUserDto): Promise<{
        success: boolean;
        data: ({
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
        }) | null;
    }>;
    getToday(companyId: string, departmentId?: string, locationId?: string, date?: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    getByEmployeeIds(companyId: string, employeeIdsStr: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    getLive(companyId: string, departmentId?: string, locationId?: string, date?: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    getByEmployee(user: CurrentUserDto, id: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
}
