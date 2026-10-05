import { MissionService } from './mission.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
export declare class MissionController {
    private readonly missionService;
    constructor(missionService: MissionService);
    findAll(companyId: string, departmentId?: string, status?: string): Promise<{
        success: boolean;
        data: {
            id: any;
            title: any;
            description: any;
            location: any;
            status: any;
            start_date: any;
            end_date: any;
            department_id: any;
            department: {
                id: any;
                name: any;
            } | undefined;
            employees: any;
            documents: any;
            stats: {
                total_tasks: any;
                completed_tasks: any;
                progression_percentage: number;
            };
            created_at: any;
            updated_at: any;
        }[];
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: any;
            title: any;
            description: any;
            location: any;
            status: any;
            start_date: any;
            end_date: any;
            department_id: any;
            department: {
                id: any;
                name: any;
            } | undefined;
            employees: any;
            documents: any;
            stats: {
                total_tasks: any;
                completed_tasks: any;
                progression_percentage: number;
            };
            created_at: any;
            updated_at: any;
        };
    }>;
    create(companyId: string, dto: CreateMissionDto): Promise<{
        success: boolean;
        data: {
            id: any;
            title: any;
            description: any;
            location: any;
            status: any;
            start_date: any;
            end_date: any;
            department_id: any;
            department: {
                id: any;
                name: any;
            } | undefined;
            employees: any;
            documents: any;
            stats: {
                total_tasks: any;
                completed_tasks: any;
                progression_percentage: number;
            };
            created_at: any;
            updated_at: any;
        };
    }>;
    update(companyId: string, id: string, dto: UpdateMissionDto): Promise<{
        success: boolean;
        data: {
            id: any;
            title: any;
            description: any;
            location: any;
            status: any;
            start_date: any;
            end_date: any;
            department_id: any;
            department: {
                id: any;
                name: any;
            } | undefined;
            employees: any;
            documents: any;
            stats: {
                total_tasks: any;
                completed_tasks: any;
                progression_percentage: number;
            };
            created_at: any;
            updated_at: any;
        };
    }>;
    assignEmployees(companyId: string, id: string, employeeIds: string[], comment?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    uploadDocuments(companyId: string, id: string, files: any[]): Promise<{
        success: boolean;
        data: {
            id: string;
            file_name: string;
            file_type: string;
            file_size: number;
            url: string;
            uploaded_by_name: string | null;
            created_at: string;
        }[];
    }>;
    deleteDocument(companyId: string, missionId: string, docId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
