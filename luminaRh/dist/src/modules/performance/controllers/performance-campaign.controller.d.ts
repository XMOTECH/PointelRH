import { PerformanceCampaignService } from '../services/performance-campaign.service';
import { CreatePerformanceCampaignDto } from '../dto/create-performance-campaign.dto';
export declare class PerformanceCampaignController {
    private readonly campaignService;
    constructor(campaignService: PerformanceCampaignService);
    create(companyId: string, dto: CreatePerformanceCampaignDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            year: number;
            title: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
            templateId: string;
        };
    }>;
    getGlobalStats(companyId: string): Promise<{
        success: boolean;
        data: {
            totalCampaigns: number;
            totalEvaluations: number;
            completedEvaluations: number;
            activeEvaluations: number;
            averageRating: number | null;
            completionRate: number;
        };
    }>;
    findAll(companyId: string): Promise<{
        success: boolean;
        data: ({
            _count: {
                evaluations: number;
            };
            template: {
                id: string;
                title: string;
                category: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            year: number;
            title: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
            templateId: string;
        })[];
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
            stats: {
                total: number;
                completed: number;
                inProgress: number;
                notStarted: number;
                completionRate: number;
            };
            template: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                title: string;
                description: string | null;
                category: string;
                sections: import("@prisma/client/runtime/library").JsonValue;
            };
            evaluations: ({
                employee: {
                    id: string;
                    department: {
                        id: string;
                        name: string;
                    };
                    email: string;
                    firstName: string;
                    lastName: string;
                    jobTitle: string | null;
                };
                evaluator: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                status: string;
                employeeId: string;
                completedAt: Date | null;
                campaignId: string;
                evaluatorId: string;
                selfRating: number | null;
                managerRating: number | null;
                finalRating: number | null;
                selfReviewData: import("@prisma/client/runtime/library").JsonValue | null;
                managerReviewData: import("@prisma/client/runtime/library").JsonValue | null;
                sharedNotes: string | null;
                employeeSignedAt: Date | null;
                managerSignedAt: Date | null;
                pdfSummaryUrl: string | null;
            })[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            year: number;
            title: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
            templateId: string;
        };
    }>;
    close(companyId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: string;
            year: number;
            title: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
            templateId: string;
        };
    }>;
}
