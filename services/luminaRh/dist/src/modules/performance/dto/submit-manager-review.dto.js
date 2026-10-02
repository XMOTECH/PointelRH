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
exports.SubmitManagerReviewDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SubmitManagerReviewDto {
    answers;
    managerRating;
    sharedNotes;
}
exports.SubmitManagerReviewDto = SubmitManagerReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Évaluations et commentaires du manager par question',
        example: { 'sec_skills_q1': 4, 'sec_goals_q1': 'Très bon travail' },
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Les données d\'évaluation managériale sont requises' }),
    __metadata("design:type", Object)
], SubmitManagerReviewDto.prototype, "answers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Note globale attribuée par le manager (sur 5)',
        example: 4.5,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    (0, class_validator_1.IsNotEmpty)({ message: 'La note managériale globale est requise' }),
    __metadata("design:type", Number)
], SubmitManagerReviewDto.prototype, "managerRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Synthèse des échanges et décisions communes lors de l\'entretien en présentiel',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitManagerReviewDto.prototype, "sharedNotes", void 0);
//# sourceMappingURL=submit-manager-review.dto.js.map