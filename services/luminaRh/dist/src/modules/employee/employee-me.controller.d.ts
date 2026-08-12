import { EmployeeService } from './employee.service';
import { CurrentUserDto } from '../../common/decorators/current-user.decorator';
export declare class EmployeeMeController {
    private readonly employeeService;
    constructor(employeeService: EmployeeService);
    getMe(user: CurrentUserDto): Promise<{
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
}
