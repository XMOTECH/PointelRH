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
exports.CreateSessionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateSessionDto {
    templateId;
    candidateFirstName;
    candidateLastName;
    candidateEmail;
    candidatePhone;
    departmentId;
    scheduleId;
    contractType;
    targetStartDate;
    probationDurationMonths;
    baseSalary;
    transportAllowance;
    managerId;
}
exports.CreateSessionDto = CreateSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'f871751e-7b03-4432-be2a-02ed5c62ccc3', description: 'UUID du template d\'onboarding à instancier' }),
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "templateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Amadou', description: 'Prénom du futur collaborateur' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "candidateFirstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Diallo', description: 'Nom de famille du futur collaborateur' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "candidateLastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'amadou.diallo@candidat.sn', description: 'Email personnel du candidat pour recevoir l\'invitation' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "candidateEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+221773169188', description: 'Numéro de téléphone mobile pour notification SMS/WhatsApp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "candidatePhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'Département d\'affectation' }),
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'f871751e-7b03-4432-be2a-02ed5c62ccc3', description: 'Planning horaire / rotation (ex: 3x8)' }),
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "scheduleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cdi', description: 'Type de contrat (cdi, cdd, stage, interim)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "contractType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-15', description: 'Date de démarrage prévue (Jour J)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "targetStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3, description: 'Durée de la période d\'essai en mois' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSessionDto.prototype, "probationDurationMonths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 350000, description: 'Salaire brut de base mensuel en FCFA' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSessionDto.prototype, "baseSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20800, description: 'Indemnité de transport légale en FCFA' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSessionDto.prototype, "transportAllowance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'UUID du Manager responsable' }),
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "managerId", void 0);
//# sourceMappingURL=create-session.dto.js.map