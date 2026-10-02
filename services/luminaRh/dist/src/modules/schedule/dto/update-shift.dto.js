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
exports.MoveShiftDto = exports.UpdateShiftDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_shift_dto_1 = require("./create-shift.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class UpdateShiftDto extends (0, swagger_1.PartialType)(create_shift_dto_1.CreateShiftDto) {
    status;
}
exports.UpdateShiftDto = UpdateShiftDto;
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ description: 'Statut du shift', enum: ['DRAFT', 'PUBLISHED', 'CONFIRMED', 'CANCELLED'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['DRAFT', 'PUBLISHED', 'CONFIRMED', 'CANCELLED']),
    __metadata("design:type", String)
], UpdateShiftDto.prototype, "status", void 0);
class MoveShiftDto {
    employeeId;
    date;
    startTime;
    endTime;
}
exports.MoveShiftDto = MoveShiftDto;
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ description: 'Nouvel ID employé (ou null pour désassigner)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], MoveShiftDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ description: 'Nouvelle date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MoveShiftDto.prototype, "date", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ description: 'Nouvelle heure de début (HH:mm)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MoveShiftDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ description: 'Nouvelle heure de fin (HH:mm)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MoveShiftDto.prototype, "endTime", void 0);
//# sourceMappingURL=update-shift.dto.js.map