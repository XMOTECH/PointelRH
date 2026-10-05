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
exports.CreateOffboardingTemplateDto = exports.CreateOffboardingTemplateTaskDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const offboarding_enums_1 = require("../entities/offboarding.enums");
class CreateOffboardingTemplateTaskDto {
    title;
    description;
    category;
    assignedRole;
    daysOffset = 0;
    isRequired = true;
    order = 0;
}
exports.CreateOffboardingTemplateTaskDto = CreateOffboardingTemplateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Titre de la tâche' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOffboardingTemplateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description détaillée', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOffboardingTemplateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: offboarding_enums_1.OffboardingTaskCategory, example: offboarding_enums_1.OffboardingTaskCategory.IT }),
    (0, class_validator_1.IsEnum)(offboarding_enums_1.OffboardingTaskCategory),
    __metadata("design:type", String)
], CreateOffboardingTemplateTaskDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: offboarding_enums_1.OffboardingTargetRole, example: offboarding_enums_1.OffboardingTargetRole.IT }),
    (0, class_validator_1.IsEnum)(offboarding_enums_1.OffboardingTargetRole),
    __metadata("design:type", String)
], CreateOffboardingTemplateTaskDto.prototype, "assignedRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Décalage en jours par rapport au dernier jour travaillé', default: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateOffboardingTemplateTaskDto.prototype, "daysOffset", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Obligatoire pour clôturer', default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateOffboardingTemplateTaskDto.prototype, "isRequired", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ordre d\'affichage', default: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateOffboardingTemplateTaskDto.prototype, "order", void 0);
class CreateOffboardingTemplateDto {
    name;
    description;
    departureType;
    departmentId;
    tasks;
}
exports.CreateOffboardingTemplateDto = CreateOffboardingTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom du modèle (ex: Départ Standard CDI)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le nom du modèle est requis' }),
    __metadata("design:type", String)
], CreateOffboardingTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description du modèle', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOffboardingTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: offboarding_enums_1.DepartureReason, required: false }),
    (0, class_validator_1.IsEnum)(offboarding_enums_1.DepartureReason),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOffboardingTemplateDto.prototype, "departureType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID du département spécifique (ou global si vide)', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOffboardingTemplateDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateOffboardingTemplateTaskDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateOffboardingTemplateTaskDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateOffboardingTemplateDto.prototype, "tasks", void 0);
//# sourceMappingURL=create-offboarding-template.dto.js.map