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
exports.SaveExitInterviewDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SaveExitInterviewDto {
    exitInterviewNotes;
    reasonsFeedback;
}
exports.SaveExitInterviewDto = SaveExitInterviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Compte-rendu de l\'entretien de départ RH / Manager' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Les notes d\'entretien sont requises' }),
    __metadata("design:type", String)
], SaveExitInterviewDto.prototype, "exitInterviewNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Retours, suggestions et feedbacks du collaborateur', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveExitInterviewDto.prototype, "reasonsFeedback", void 0);
//# sourceMappingURL=save-exit-interview.dto.js.map