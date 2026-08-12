import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, dto: CreateDepartmentDto): Promise<{
        id: string;
        name: string;
        parent_id: null;
        created_at: Date;
        updated_at: Date;
    }>;
    findAll(companyId: string): Promise<{
        id: string;
        name: string;
        parent_id: null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    findOne(companyId: string, id: string): Promise<{
        id: string;
        name: string;
        parent_id: null;
        created_at: Date;
        updated_at: Date;
    }>;
    update(companyId: string, id: string, dto: UpdateDepartmentDto): Promise<{
        id: string;
        name: string;
        parent_id: null;
        created_at: Date;
        updated_at: Date;
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
    }>;
    private mapToResource;
}
