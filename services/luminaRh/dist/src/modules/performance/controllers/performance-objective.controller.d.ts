import { CurrentUserDto } from '../../../common/decorators/current-user.decorator';
import { PerformanceObjectiveService } from '../services/performance-objective.service';
import { CreateObjectiveDto, UpdateObjectiveDto } from '../dto/create-objective.dto';
export declare class PerformanceObjectiveController {
    private readonly objectiveService;
    constructor(objectiveService: PerformanceObjectiveService);
    create(companyId: string, user: CurrentUserDto, dto: CreateObjectiveDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            employeeId: string;
            title: string;
            description: string | null;
            dueDate: Date | null;
            category: string;
            weight: number;
            targetValue: number | null;
            unit: string | null;
            currentValue: number | null;
            progress: number;
        };
    }>;
    findAll(companyId: string, user: CurrentUserDto, employeeId?: string): Promise<{
        success: boolean;
        data: ({
            employee: {
                id: string;
                firstName: string;
                lastName: string;
                jobTitle: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            employeeId: string;
            title: string;
            description: string | null;
            dueDate: Date | null;
            category: string;
            weight: number;
            targetValue: number | null;
            unit: string | null;
            currentValue: number | null;
            progress: number;
        })[];
    }>;
    update(companyId: string, id: string, user: CurrentUserDto, dto: UpdateObjectiveDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            employeeId: string;
            title: string;
            description: string | null;
            dueDate: Date | null;
            category: string;
            weight: number;
            targetValue: number | null;
            unit: string | null;
            currentValue: number | null;
            progress: number;
        };
    }>;
    delete(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            employeeId: string;
            title: string;
            description: string | null;
            dueDate: Date | null;
            category: string;
            weight: number;
            targetValue: number | null;
            unit: string | null;
            currentValue: number | null;
            progress: number;
        };
    }>;
}
