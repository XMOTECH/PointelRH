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
exports.CreateLeaveRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateLeaveRequestDto {
    leave_type_id;
    start_date;
    end_date;
    reason;
    half_day;
    half_day_period;
}
exports.CreateLeaveRequestDto = CreateLeaveRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'e4b37d80-5a5c-4f7f-829b-02ed5c62ccc3', description: 'UUID du type de congé' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le type de congé est requis' }),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "leave_type_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-01', description: 'Date de début (format YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La date de début est requise' }),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-10', description: 'Date de fin (format YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La date de fin est requise' }),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Congés annuels d\'été', description: 'Raison ou motif de la demande', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'S\'agit-il d\'une demi-journée ?', default: false, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLeaveRequestDto.prototype, "half_day", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'morning', description: 'Période de la demi-journée (morning, afternoon)', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['morning', 'afternoon']),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "half_day_period", void 0);
//# sourceMappingURL=create-leave.dto.js.map