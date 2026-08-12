import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    private dashboardCache;
    private readonly CACHE_TTL_MS;
    private readonly logger;
    constructor(prisma: PrismaService);
    getDashboardStats(companyId: string): Promise<any>;
    handleAttendanceRecorded(payload: {
        companyId: string;
    }): void;
    getDepartmentStats(companyId: string): Promise<{
        department_name: string;
        employee_count: number;
    }[]>;
    getPresenceTrend(companyId: string): Promise<{
        date: string;
        present: number;
        absent: number;
        late: number;
    }[]>;
}
