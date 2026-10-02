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
exports.CreatePerformanceCampaignDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePerformanceCampaignDto {
    title;
    description;
    templateId;
    year;
    startDate;
    endDate;
    departmentIds;
    employeeIds;
}
exports.CreatePerformanceCampaignDto = CreatePerformanceCampaignDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Titre de la campagne (ex: Campagne d\'évaluation Annuelle 2026)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le titre de la campagne est requis' }),
    __metadata("design:type", String)
], CreatePerformanceCampaignDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description et consignes pour les managers et collaborateurs', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePerformanceCampaignDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID du modèle de formulaire (PerformanceTemplate) à utiliser' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le modèle d\'évaluation est obligatoire' }),
    __metadata("design:type", String)
], CreatePerformanceCampaignDto.prototype, "templateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Année de référence (ex: 2026)', example: 2026 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreatePerformanceCampaignDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de début de la campagne (ISO 8601)', example: '2026-10-01T00:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePerformanceCampaignDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date limite de réalisation (ISO 8601)', example: '2026-12-15T23:59:59.000Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePerformanceCampaignDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Liste optionnelle des IDs de départements ciblés (si omis, toute l\'entreprise)',
        required: false,
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePerformanceCampaignDto.prototype, "departmentIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Liste optionnelle des IDs d\'employés ciblés (sélection manuelle)',
        required: false,
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePerformanceCampaignDto.prototype, "employeeIds", void 0);
//# sourceMappingURL=create-performance-campaign.dto.js.map