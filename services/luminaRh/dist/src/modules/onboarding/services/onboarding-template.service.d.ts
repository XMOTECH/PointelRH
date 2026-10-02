import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
export declare class OnboardingTemplateService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(companyId: string, dto: CreateTemplateDto): Promise<any>;
    findAll(companyId: string): Promise<any>;
    findOne(companyId: string, templateId: string): Promise<any>;
    seedDefaultTemplates(companyId: string): Promise<void>;
}
