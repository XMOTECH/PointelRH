import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    findAll(companyId: string, departmentId?: string, missionId?: string, employeeId?: string, status?: string): Promise<{
        success: boolean;
        data: {
            id: any;
            title: any;
            description: any;
            priority: any;
            status: any;
            due_date: any;
            recurrence: any;
            estimated_minutes: any;
            actual_minutes: any;
            completed_at: any;
            assigned_to: any;
            assignee_name: string | null;
            created_by: any;
            creator_name: string | null;
            department_id: any;
            mission_id: any;
            mission_title: any;
            comments: any;
            created_at: any;
            updated_at: any;
        }[];
    }>;
    create(companyId: string, userId: string, dto: CreateTaskDto): Promise<{
        success: boolean;
        data: {
            id: any;
            title: any;
            description: any;
            priority: any;
            status: any;
            due_date: any;
            recurrence: any;
            estimated_minutes: any;
            actual_minutes: any;
            completed_at: any;
            assigned_to: any;
            assignee_name: string | null;
            created_by: any;
            creator_name: string | null;
            department_id: any;
            mission_id: any;
            mission_title: any;
            comments: any;
            created_at: any;
            updated_at: any;
        };
    }>;
    update(companyId: string, id: string, dto: any): Promise<{
        success: boolean;
        data: {
            id: any;
            title: any;
            description: any;
            priority: any;
            status: any;
            due_date: any;
            recurrence: any;
            estimated_minutes: any;
            actual_minutes: any;
            completed_at: any;
            assigned_to: any;
            assignee_name: string | null;
            created_by: any;
            creator_name: string | null;
            department_id: any;
            mission_id: any;
            mission_title: any;
            comments: any;
            created_at: any;
            updated_at: any;
        };
    }>;
    remove(companyId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addComment(id: string, userId: string, content: string, attachments?: any[]): Promise<{
        success: boolean;
        data: {
            id: string;
            content: string;
            employee_name: string;
            attachment_path: string | null;
            attachments: {
                id: string;
                file_name: string;
                file_type: string;
                file_size: number;
                url: string;
            }[];
            created_at: string;
        };
    }>;
}
