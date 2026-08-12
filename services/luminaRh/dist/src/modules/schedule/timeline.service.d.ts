import { PrismaService } from '../../prisma/prisma.service';
export declare class TimelineService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTeamTimeline(companyId: string, start: string, end: string, departmentId?: string): Promise<{
        employeeId: string;
        firstName: string;
        lastName: string;
        scheduleName: string | null;
        shifts: any[];
    }[]>;
    private formatDate;
}
