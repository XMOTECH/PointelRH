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
exports.UpdateScheduleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateScheduleDto {
    name;
    start_time;
    end_time;
    grace_minutes;
    work_days;
}
exports.UpdateScheduleDto = UpdateScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Horaire de bureau (8h-17h)', description: 'Nom de l\'horaire de travail', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le nom de l\'horaire ne peut pas être vide' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateScheduleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '08:00', description: 'Heure de début', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateScheduleDto.prototype, "start_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '17:00', description: 'Heure de fin', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateScheduleDto.prototype, "end_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Tolérance de retard en minutes', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateScheduleDto.prototype, "grace_minutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: [1, 2, 3, 4, 5], description: 'Jours travaillés (1=Lun, 7=Dim)', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateScheduleDto.prototype, "work_days", void 0);
//# sourceMappingURL=update-schedule.dto.js.map