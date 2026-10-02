import { OnboardingSessionService } from '../services/onboarding-session.service';
import { OnboardingDocumentService } from '../services/onboarding-document.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { ReviewDocumentDto } from '../dto/review-document.dto';
export declare class OnboardingSessionController {
    private readonly sessionService;
    private readonly documentService;
    constructor(sessionService: OnboardingSessionService, documentService: OnboardingDocumentService);
    create(companyId: string, creatorId: string, dto: CreateSessionDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    findAll(companyId: string, status?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateTask(companyId: string, userId: string, sessionId: string, taskId: string, dto: UpdateTaskDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    reviewDocument(companyId: string, reviewerId: string, docId: string, dto: ReviewDocumentDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    approveReviewAndProvision(companyId: string, reviewerId: string, sessionId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    cancel(companyId: string, userId: string, sessionId: string, body: {
        reason: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
