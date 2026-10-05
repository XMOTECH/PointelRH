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
exports.CreateTemplateDto = exports.CreateTemplateTaskDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const onboarding_enums_1 = require("../entities/onboarding.enums");
class CreateTemplateTaskDto {
    title;
    description;
    category;
    targetRole;
    daysOffset;
    isRequired;
    order;
    prerequisiteId;
}
exports.CreateTemplateTaskDto = CreateTemplateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Visite médicale d\'aptitude', description: 'Intitulé de la tâche' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTemplateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Visite médicale d\'embauche auprès de la médecine du travail de l\'usine' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTemplateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: onboarding_enums_1.TaskCategory, default: onboarding_enums_1.TaskCategory.ADMINISTRATIVE }),
    (0, class_validator_1.IsEnum)(onboarding_enums_1.TaskCategory),
    __metadata("design:type", String)
], CreateTemplateTaskDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: onboarding_enums_1.TargetRole, default: onboarding_enums_1.TargetRole.CANDIDATE }),
    (0, class_validator_1.IsEnum)(onboarding_enums_1.TargetRole),
    __metadata("design:type", String)
], CreateTemplateTaskDto.prototype, "targetRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -7, description: 'Décalage en jours par rapport au Jour J (-7 = J-7, 0 = J0, 30 = J+30)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTemplateTaskDto.prototype, "daysOffset", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTemplateTaskDto.prototype, "isRequired", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 0 }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTemplateTaskDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Index ou UUID de la tâche préalable (DAG)', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTemplateTaskDto.prototype, "prerequisiteId", void 0);
class CreateTemplateDto {
    name;
    description;
    contractType;
    departmentId;
    tasks;
}
exports.CreateTemplateDto = CreateTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ouvrier Usine 3x8 - SOCOCIM', description: 'Nom du modèle d\'onboarding' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Modèle dédié aux postes de production et de maintenance en environnement industriel' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'cdi', description: 'Type de contrat associé (cdi, cdd, stage, interim)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "contractType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'Département par défaut' }),
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateTemplateTaskDto], description: 'Liste des tâches modèles associées' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateTemplateTaskDto),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "tasks", void 0);
//# sourceMappingURL=create-template.dto.js.map