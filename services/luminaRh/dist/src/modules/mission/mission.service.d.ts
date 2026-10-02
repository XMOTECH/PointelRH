import { PrismaService } from '../../prisma/prisma.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
export declare class MissionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, filters: {
        departmentId?: string;
        status?: string;
    }): Promise<{
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
    }[]>;
    findOne(companyId: string, id: string): Promise<{
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
    }>;
    create(companyId: string, dto: CreateMissionDto): Promise<{
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
    }>;
    private filterCompanyEmployees;
    update(companyId: string, id: string, dto: UpdateMissionDto): Promise<{
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
    }>;
    assignEmployees(companyId: string, id: string, employeeIds: string[], comment?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
    }>;
    findMyMissions(employeeId: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        location: string | null;
        status: string;
        start_date: string;
        end_date: string | null;
        department: string | null;
        assignment_status: string;
        comment: null;
        assigned_at: string;
        stats: {
            total_tasks: number;
            completed_tasks: number;
            progression_percentage: number;
        };
    }[]>;
    findMyMissionDetail(employeeId: string, companyId: string, id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        location: string | null;
        status: string;
        start_date: string;
        end_date: string | null;
        department: {
            id: string;
            name: string;
        } | null;
        stats: {
            total_tasks: number;
            completed_tasks: number;
            progression_percentage: number;
            my_tasks_total: number;
            my_tasks_completed: number;
        };
        my_tasks: {
            id: string;
            title: string;
            description: string | null;
            priority: string;
            status: string;
            due_date: string | null;
            estimated_minutes: number | null;
            actual_minutes: number;
            completed_at: string | null;
            creator_name: string | null;
            comments: {
                id: any;
                content: any;
                employee_name: string;
                attachments: any;
                created_at: any;
            }[];
            created_at: string;
            updated_at: string;
        }[];
        documents: {
            id: string;
            file_name: string;
            file_type: string;
            file_size: number;
            url: string;
            uploaded_by_name: string | null;
            created_at: string;
        }[];
        coworkers: {
            id: string;
            first_name: string;
            last_name: string;
            role: string;
        }[];
    }>;
    uploadDocuments(companyId: string, missionId: string, files: any[]): Promise<{
        id: string;
        file_name: string;
        file_type: string;
        file_size: number;
        url: string;
        uploaded_by_name: string | null;
        created_at: string;
    }[]>;
    deleteDocument(companyId: string, missionId: string, docId: string): Promise<{
        success: boolean;
    }>;
    private mapToMissionResource;
}
