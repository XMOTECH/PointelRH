import { PrismaService } from '../../../prisma/prisma.service';
import { CurrentUserDto } from '../../../common/decorators/current-user.decorator';
import { CreateObjectiveDto, UpdateObjectiveDto } from '../dto/create-objective.dto';
export declare class PerformanceObjectiveService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, user: CurrentUserDto, dto: CreateObjectiveDto): Promise<{
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
    }>;
    findAll(companyId: string, user: CurrentUserDto, employeeId?: string): Promise<({
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
    })[]>;
    update(companyId: string, id: string, user: CurrentUserDto, dto: UpdateObjectiveDto): Promise<{
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
    }>;
    delete(companyId: string, id: string): Promise<{
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
    }>;
}
