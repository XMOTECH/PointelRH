import { OnboardingSessionService } from '../services/onboarding-session.service';
import { OnboardingDocumentService } from '../services/onboarding-document.service';
import { SubmitCandidateDataDto } from '../dto/submit-candidate-data.dto';
export declare class OnboardingCandidateController {
    private readonly sessionService;
    private readonly documentService;
    constructor(sessionService: OnboardingSessionService, documentService: OnboardingDocumentService);
    getCandidateSession(token: string, clientIp: string): Promise<{
        success: boolean;
        data: any;
    }>;
    submitData(token: string, dto: SubmitCandidateDataDto, clientIp: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    registerDocument(token: string, body: {
        documentType: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        storageKey: string;
    }, clientIp: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
