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
exports.UpdateObjectiveDto = exports.CreateObjectiveDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const performance_enums_1 = require("../entities/performance.enums");
class CreateObjectiveDto {
    employeeId;
    title;
    description;
    category = performance_enums_1.ObjectiveCategory.INDIVIDUAL;
    weight = 1;
    targetValue;
    unit;
    dueDate;
}
exports.CreateObjectiveDto = CreateObjectiveDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID du collaborateur concerné' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateObjectiveDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Titre de l\'objectif (ex: Augmenter le taux de rétention client de 15%)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateObjectiveDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description et critères d\'évaluation', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateObjectiveDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: performance_enums_1.ObjectiveCategory, default: performance_enums_1.ObjectiveCategory.INDIVIDUAL }),
    (0, class_validator_1.IsEnum)(performance_enums_1.ObjectiveCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateObjectiveDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pondération (poids relatif de l\'objectif)', default: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateObjectiveDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Valeur cible numérique', required: false, example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateObjectiveDto.prototype, "targetValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unité de mesure (ex: %, EUR, points)', required: false, example: '%' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateObjectiveDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Échéance prévue (date)', required: false, example: '2026-12-31' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateObjectiveDto.prototype, "dueDate", void 0);
class UpdateObjectiveDto {
    title;
    description;
    currentValue;
    progress;
    status;
}
exports.UpdateObjectiveDto = UpdateObjectiveDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Titre de l\'objectif', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateObjectiveDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateObjectiveDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Valeur actuelle mesurée', required: false, example: 75 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateObjectiveDto.prototype, "currentValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pourcentage de progression global (0 à 100)', example: 75, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateObjectiveDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: performance_enums_1.ObjectiveStatus, required: false }),
    (0, class_validator_1.IsEnum)(performance_enums_1.ObjectiveStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateObjectiveDto.prototype, "status", void 0);
//# sourceMappingURL=create-objective.dto.js.map