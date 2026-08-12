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
exports.CreateEmployeeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateEmployeeDto {
    firstName;
    lastName;
    email;
    departmentId;
    scheduleId;
    contractType;
    hireDate;
    pinCode;
    role;
}
exports.CreateEmployeeDto = CreateEmployeeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Amadou', description: 'Prénom de l\'employé' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le prénom est requis' }),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Diallo', description: 'Nom de famille de l\'employé' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le nom de famille est requis' }),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'amadou@luminarh.sn', description: 'Adresse email de l\'employé' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Format d\'email invalide' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'L\'email est requis' }),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'UUID du département de l\'employé' }),
    (0, class_validator_1.IsUUID)('4', { message: 'Format du département invalide' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le département est requis' }),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'f871751e-7b03-4432-be2a-02ed5c62ccc3', description: 'UUID du planning assigné', required: false }),
    (0, class_validator_1.IsUUID)('4', { message: 'Format du planning invalide' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "scheduleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cdi', description: 'Type de contrat (cdi, cdd, stage, interim)', default: 'cdi', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "contractType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-06-11', description: 'Date de recrutement (YYYY-MM-DD)', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "hireDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234', description: 'Code PIN à 4 chiffres pour pointer sur Kiosque', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "pinCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'employee', description: 'Rôle d\'accès (employee, admin, manager)', default: 'employee', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "role", void 0);
//# sourceMappingURL=create-employee.dto.js.map