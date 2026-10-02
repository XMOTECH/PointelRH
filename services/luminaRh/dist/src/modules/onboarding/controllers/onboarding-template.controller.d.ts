import { OnboardingTemplateService } from '../services/onboarding-template.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
export declare class OnboardingTemplateController {
    private readonly templateService;
    constructor(templateService: OnboardingTemplateService);
    create(companyId: string, dto: CreateTemplateDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    findAll(companyId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    findOne(companyId: string, id: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
