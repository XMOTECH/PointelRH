import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentController {
    private readonly departmentService;
    constructor(departmentService: DepartmentService);
    create(companyId: string, dto: CreateDepartmentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            parent_id: null;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    findAll(companyId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            parent_id: null;
            created_at: Date;
            updated_at: Date;
        }[];
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            parent_id: null;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    update(companyId: string, id: string, dto: UpdateDepartmentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            parent_id: null;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
