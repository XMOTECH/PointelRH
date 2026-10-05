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
exports.CreateMissionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateMissionDto {
    title;
    description;
    location;
    status;
    start_date;
    end_date;
    department_id;
    employee_ids;
}
exports.CreateMissionDto = CreateMissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Déploiement client Dakar', description: 'Titre de la mission' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le titre est requis' }),
    __metadata("design:type", String)
], CreateMissionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Installation serveur et réseau chez le client', description: 'Description de la mission', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMissionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'VDN, Dakar', description: 'Lieu géographique de la mission', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMissionDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'active', description: 'Statut de la mission (draft, active, completed, cancelled)', default: 'draft', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMissionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-05T08:00:00Z', description: 'Date de début de la mission' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La date de début est requise' }),
    __metadata("design:type", String)
], CreateMissionDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-15T18:00:00Z', description: 'Date de fin de la mission', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMissionDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'UUID du département', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMissionDto.prototype, "department_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['uuid-employe-1', 'uuid-employe-2'], description: 'UUIDs des employés affectés à la mission', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateMissionDto.prototype, "employee_ids", void 0);
//# sourceMappingURL=create-mission.dto.js.map