import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboard(companyId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getDepartments(companyId: string): Promise<{
        success: boolean;
        data: {
            department_name: string;
            employee_count: number;
        }[];
    }>;
    getPresenceTrend(companyId: string): Promise<{
        success: boolean;
        data: {
            date: string;
            present: number;
            absent: number;
            late: number;
        }[];
    }>;
}
