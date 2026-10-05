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
exports.UpdateShiftTemplateDto = exports.CreateShiftTemplateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateShiftTemplateDto {
    name;
    startTime;
    endTime;
    breakMinutes;
    color;
    jobTitle;
    departmentId;
}
exports.CreateShiftTemplateDto = CreateShiftTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom du modèle', example: 'Service Matin' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShiftTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Heure de début (HH:mm)', example: '07:00' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'L\'heure de début doit être au format HH:mm' }),
    __metadata("design:type", String)
], CreateShiftTemplateDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Heure de fin (HH:mm)', example: '15:30' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'L\'heure de fin doit être au format HH:mm' }),
    __metadata("design:type", String)
], CreateShiftTemplateDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pause en minutes', default: 30, example: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(240),
    __metadata("design:type", Number)
], CreateShiftTemplateDto.prototype, "breakMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Couleur hexadécimale', default: '#3B82F6' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShiftTemplateDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Poste associé' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShiftTemplateDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID du département' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateShiftTemplateDto.prototype, "departmentId", void 0);
class UpdateShiftTemplateDto {
    name;
    startTime;
    endTime;
    breakMinutes;
    color;
    jobTitle;
    isActive;
}
exports.UpdateShiftTemplateDto = UpdateShiftTemplateDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nom du modèle' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateShiftTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Heure de début (HH:mm)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/),
    __metadata("design:type", String)
], UpdateShiftTemplateDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Heure de fin (HH:mm)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/),
    __metadata("design:type", String)
], UpdateShiftTemplateDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pause en minutes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(240),
    __metadata("design:type", Number)
], UpdateShiftTemplateDto.prototype, "breakMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Couleur' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateShiftTemplateDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Poste' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateShiftTemplateDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Actif ou non' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateShiftTemplateDto.prototype, "isActive", void 0);
//# sourceMappingURL=shift-template.dto.js.map