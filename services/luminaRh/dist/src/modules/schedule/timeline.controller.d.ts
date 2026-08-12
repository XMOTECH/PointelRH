import { TimelineService } from './timeline.service';
export declare class TimelineController {
    private readonly timelineService;
    constructor(timelineService: TimelineService);
    getTeamTimeline(companyId: string, start: string, end: string, departmentId?: string): Promise<{
        success: boolean;
        data: {
            employeeId: string;
            firstName: string;
            lastName: string;
            scheduleName: string | null;
            shifts: any[];
        }[];
    }>;
    getOccupancy(companyId: string, date?: string, departmentId?: string): Promise<{
        success: boolean;
        data: {
            date: string;
            total: number;
            working: number;
            onLeave: number;
            absent: number;
            occupancyRate: number;
        };
    }>;
}
