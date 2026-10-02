"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePerformanceTemplateDto = exports.EvaluationSectionDto = exports.EvaluationQuestionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const performance_enums_1 = require("../entities/performance.enums");
class EvaluationQuestionDto {
    id;
    label;
    hint;
    type;
    isRequired = true;
    options;
}
exports.EvaluationQuestionDto = EvaluationQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Identifiant unique de la question dans le formulaire' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EvaluationQuestionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Libellé de la question ou critère d\'évaluation' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EvaluationQuestionDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description ou aide à la réponse', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EvaluationQuestionDto.prototype, "hint", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type de réponse attendue (RATING_1_5, TEXT, YES_NO, MULTIPLE_CHOICE)',
        example: 'RATING_1_5',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EvaluationQuestionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'La question est-elle obligatoire ?', default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], EvaluationQuestionDto.prototype, "isRequired", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Options possibles si MULTIPLE_CHOICE', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], EvaluationQuestionDto.prototype, "options", void 0);
class EvaluationSectionDto {
    id;
    title;
    description;
    weight = 1;
    questions;
}
exports.EvaluationSectionDto = EvaluationSectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Identifiant de la section (ex: sec_skills, sec_goals)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EvaluationSectionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Titre de la section' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EvaluationSectionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description de la section', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EvaluationSectionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pondération de la section dans la note globale', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EvaluationSectionDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [EvaluationQuestionDto], description: 'Questions de la section' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], EvaluationSectionDto.prototype, "questions", void 0);
class CreatePerformanceTemplateDto {
    title;
    description;
    category = performance_enums_1.TemplateCategory.ANNUAL;
    sections;
}
exports.CreatePerformanceTemplateDto = CreatePerformanceTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Titre du template (ex: Entretien Annuel Cadres & Managers)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le titre du template est requis' }),
    __metadata("design:type", String)
], CreatePerformanceTemplateDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description détaillée', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePerformanceTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: performance_enums_1.TemplateCategory, default: performance_enums_1.TemplateCategory.ANNUAL }),
    (0, class_validator_1.IsEnum)(performance_enums_1.TemplateCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePerformanceTemplateDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [EvaluationSectionDto],
        description: 'Liste des sections composant le formulaire',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Au moins une section est requise' }),
    __metadata("design:type", Array)
], CreatePerformanceTemplateDto.prototype, "sections", void 0);
//# sourceMappingURL=create-performance-template.dto.js.map