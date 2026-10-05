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
exports.SubmitCandidateDataDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SubmitCandidateDataDto {
    birthDate;
    birthPlace;
    nationality;
    gender;
    nationalIdNumber;
    address;
    maritalStatus;
    childrenCount;
    bankName;
    bankRib;
    mobileMoneyProvider;
    mobileMoneyNumber;
    ipresNumber;
    cssNumber;
    emergencyContactName;
    emergencyContactPhone;
    emergencyContactRelation;
    shoeSize;
    clothingSize;
}
exports.SubmitCandidateDataDto = SubmitCandidateDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1995-04-12', description: 'Date de naissance (YYYY-MM-DD)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Thiès', description: 'Lieu de naissance' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "birthPlace", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sénégalaise', description: 'Nationalité' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'male', description: 'Genre (male, female)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1 755 1995 01234', description: 'Numéro d\'Identification Nationale (NIN / CNI CEDEAO)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "nationalIdNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Quartier Cité Lamy, Rufisque, Dakar', description: 'Adresse de résidence' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'married', description: 'Situation matrimoniale (single, married, widowed, divorced)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "maritalStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, description: 'Nombre d\'enfants à charge légalement déclarés' }),
    (0, class_validator_1.IsInt)({ message: 'Le nombre d\'enfants doit être un entier' }),
    (0, class_validator_1.Min)(0, { message: 'Le nombre d\'enfants ne peut pas être négatif' }),
    (0, class_validator_1.Max)(30, { message: 'Le nombre d\'enfants ne peut pas dépasser 30' }),
    __metadata("design:type", Number)
], SubmitCandidateDataDto.prototype, "childrenCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'CBAO Groupe Attijariwafa Bank', description: 'Nom de l\'établissement bancaire' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SN012 01001 012345678901 45', description: 'Relevé d\'Identité Bancaire (RIB/IBAN)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "bankRib", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'wave', description: 'Opérateur Mobile Money (wave, orange_money, free_money)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "mobileMoneyProvider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+221773169188', description: 'Numéro de compte Mobile Money' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "mobileMoneyNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '12345678', description: 'Numéro d\'immatriculation IPRES si déjà existant' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "ipresNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '87654321', description: 'Numéro d\'immatriculation Caisse de Sécurité Sociale (CSS)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "cssNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Fatou Ndiaye', description: 'Nom et prénom de la personne à contacter en cas d\'urgence' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "emergencyContactName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+221771234567', description: 'Téléphone de la personne à contacter en cas d\'urgence' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Épouse', description: 'Lien de parenté avec le contact d\'urgence' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "emergencyContactRelation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '43', description: 'Pointure de chaussures de sécurité' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "shoeSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'L', description: 'Taille de combinaison / vêtements de travail' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitCandidateDataDto.prototype, "clothingSize", void 0);
//# sourceMappingURL=submit-candidate-data.dto.js.map