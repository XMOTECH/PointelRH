import { TaskService } from './task.service';
import { CreateMyTaskDto } from './dto/create-my-task.dto';
import { UpdateMyTaskDto } from './dto/update-my-task.dto';
import { CurrentUserDto } from '../../common/decorators/current-user.decorator';
export declare class EmployeeTaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    findMyTasks(user: CurrentUserDto, status?: string): Promise<{
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
    updateMyTaskStatus(user: CurrentUserDto, id: string, status: string): Promise<{
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
    logTime(user: CurrentUserDto, id: string, minutes: number): Promise<{
        success: boolean;
        data: {
            actual_minutes: number;
        };
    }>;
    createMyTask(user: CurrentUserDto, missionId: string, dto: CreateMyTaskDto): Promise<{
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
    updateMyTask(user: CurrentUserDto, id: string, dto: UpdateMyTaskDto): Promise<{
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
    addMyComment(user: CurrentUserDto, id: string, content: string, attachments?: any[]): Promise<{
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
