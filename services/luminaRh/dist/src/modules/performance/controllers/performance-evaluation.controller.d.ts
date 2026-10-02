import { CurrentUserDto } from '../../../common/decorators/current-user.decorator';
import { PerformanceEvaluationService } from '../services/performance-evaluation.service';
import { SubmitSelfReviewDto } from '../dto/submit-self-review.dto';
import { SubmitManagerReviewDto } from '../dto/submit-manager-review.dto';
import { SignEvaluationDto } from '../dto/sign-evaluation.dto';
export declare class PerformanceEvaluationController {
    private readonly evaluationService;
    constructor(evaluationService: PerformanceEvaluationService);
    findAll(companyId: string, user: CurrentUserDto, campaignId?: string, status?: string, employeeId?: string): Promise<{
        success: boolean;
        data: ({
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
            campaign: {
                id: string;
                status: string;
                year: number;
                title: string;
                endDate: Date;
            };
            evaluator: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                jobTitle: string | null;
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
    }>;
    findOne(companyId: string, id: string, user: CurrentUserDto): Promise<{
        success: boolean;
        data: {
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
            auditLogs: {
                id: string;
                createdAt: Date;
                action: string;
                actorId: string | null;
                details: import("@prisma/client/runtime/library").JsonValue | null;
                actorIp: string | null;
                evaluationId: string;
            }[];
            campaign: {
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
            };
            evaluator: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                jobTitle: string | null;
            };
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
        };
    }>;
    startSelfEvaluation(companyId: string, id: string, user: CurrentUserDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    saveDraftSelfReview(companyId: string, id: string, user: CurrentUserDto, dto: SubmitSelfReviewDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    submitSelfReview(companyId: string, id: string, user: CurrentUserDto, dto: SubmitSelfReviewDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    submitManagerReview(companyId: string, id: string, user: CurrentUserDto, dto: SubmitManagerReviewDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    sign(companyId: string, id: string, user: CurrentUserDto, dto: SignEvaluationDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
}
