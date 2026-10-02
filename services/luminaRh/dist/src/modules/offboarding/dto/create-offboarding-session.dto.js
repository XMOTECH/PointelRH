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
exports.CreateOffboardingSessionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const offboarding_enums_1 = require("../entities/offboarding.enums");
class CreateOffboardingSessionDto {
    employeeId;
    departureReason;
    noticePeriodType = offboarding_enums_1.NoticePeriodType.WORKED;
    notificationDate;
    lastWorkingDate;
    contractEndDate;
    templateId;
    handoverNotes;
}
exports.CreateOffboardingSessionDto = CreateOffboardingSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "UUID de l'employé concerné par le départ" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "L'employé est requis" }),
    __metadata("design:type", String)
], CreateOffboardingSessionDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Motif du départ',
        enum: offboarding_enums_1.DepartureReason,
        example: offboarding_enums_1.DepartureReason.RESIGNATION,
    }),
    (0, class_validator_1.IsEnum)(offboarding_enums_1.DepartureReason, { message: 'Motif de départ invalide' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le motif de départ est requis' }),
    __metadata("design:type", String)
], CreateOffboardingSessionDto.prototype, "departureReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type de préavis',
        enum: offboarding_enums_1.NoticePeriodType,
        example: offboarding_enums_1.NoticePeriodType.WORKED,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(offboarding_enums_1.NoticePeriodType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOffboardingSessionDto.prototype, "noticePeriodType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de notification / remise de la lettre', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOffboardingSessionDto.prototype, "notificationDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dernier jour effectif de présence' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le dernier jour de travail est requis' }),
    __metadata("design:type", String)
], CreateOffboardingSessionDto.prototype, "lastWorkingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de fin officielle du contrat' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La date de fin de contrat est requise' }),
    __metadata("design:type", String)
], CreateOffboardingSessionDto.prototype, "contractEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID du modèle de checklist à appliquer', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOffboardingSessionDto.prototype, "templateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes de passation initiales', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOffboardingSessionDto.prototype, "handoverNotes", void 0);
//# sourceMappingURL=create-offboarding-session.dto.js.map