import { MissionService } from './mission.service';
import { CurrentUserDto } from '../../common/decorators/current-user.decorator';
export declare class EmployeeMissionController {
    private readonly missionService;
    constructor(missionService: MissionService);
    findMyMissions(user: CurrentUserDto): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
    findMyMissionDetail(user: CurrentUserDto, id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
}
