import { TemplateCategory } from '../entities/performance.enums';
export declare class EvaluationQuestionDto {
    id: string;
    label: string;
    hint?: string;
    type: 'RATING_1_5' | 'TEXT' | 'YES_NO' | 'MULTIPLE_CHOICE';
    isRequired?: boolean;
    options?: string[];
}
export declare class EvaluationSectionDto {
    id: string;
    title: string;
    description?: string;
    weight?: number;
    questions: EvaluationQuestionDto[];
}
export declare class CreatePerformanceTemplateDto {
    title: string;
    description?: string;
    category?: TemplateCategory;
    sections: EvaluationSectionDto[];
}
