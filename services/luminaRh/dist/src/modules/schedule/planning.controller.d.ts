export declare class PlanningController {
    saveOverride(_companyId: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            date: any;
            status: string;
            reason: any;
            startTime?: undefined;
            endTime?: undefined;
        };
    } | {
        success: boolean;
        message: string;
        data: {
            date: any;
            startTime: any;
            endTime: any;
            status: string;
            reason?: undefined;
        };
    }>;
}
