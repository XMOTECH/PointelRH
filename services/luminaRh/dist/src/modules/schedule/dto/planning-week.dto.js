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
exports.PublishWeekDto = exports.DuplicateWeekDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class DuplicateWeekDto {
    sourceWeekStart;
    targetWeekStart;
    departmentId;
    overwriteExisting;
}
exports.DuplicateWeekDto = DuplicateWeekDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de début de la semaine source (lundi YYYY-MM-DD)', example: '2026-10-05' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DuplicateWeekDto.prototype, "sourceWeekStart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de début de la semaine cible (lundi YYYY-MM-DD)', example: '2026-10-12' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DuplicateWeekDto.prototype, "targetWeekStart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID du département (optionnel, pour dupliquer uniquement une équipe)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DuplicateWeekDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Écraser les shifts existants de la semaine cible si présents', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DuplicateWeekDto.prototype, "overwriteExisting", void 0);
class PublishWeekDto {
    weekStart;
    departmentId;
}
exports.PublishWeekDto = PublishWeekDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de début de la semaine à publier (lundi YYYY-MM-DD)', example: '2026-10-05' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PublishWeekDto.prototype, "weekStart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID du département à publier' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PublishWeekDto.prototype, "departmentId", void 0);
//# sourceMappingURL=planning-week.dto.js.map