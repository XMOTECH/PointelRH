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
exports.CreateMyTaskDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateMyTaskDto {
    title;
    description;
    priority;
    due_date;
    estimated_minutes;
}
exports.CreateMyTaskDto = CreateMyTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Corriger le bug de connexion', description: 'Titre de la tâche personnelle' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le titre est requis' }),
    __metadata("design:type", String)
], CreateMyTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bug survenu lors de l\'authentification google', description: 'Description', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMyTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'high', description: 'Priorité de la tâche (low, medium, high)', default: 'medium', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['low', 'medium', 'high']),
    __metadata("design:type", String)
], CreateMyTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-15T18:00:00Z', description: 'Date d\'échéance', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMyTaskDto.prototype, "due_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45, description: 'Temps estimé en minutes', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMyTaskDto.prototype, "estimated_minutes", void 0);
//# sourceMappingURL=create-my-task.dto.js.map