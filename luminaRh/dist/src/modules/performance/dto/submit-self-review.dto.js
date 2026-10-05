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
exports.SubmitSelfReviewDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SubmitSelfReviewDto {
    answers;
    selfRating;
}
exports.SubmitSelfReviewDto = SubmitSelfReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Réponses structurées de l\'auto-évaluation (clé = questionId, valeur = note ou texte)',
        example: { 'sec_skills_q1': 4, 'sec_goals_q1': 'Objectif atteint avec succès' },
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Les données d\'auto-évaluation sont requises' }),
    __metadata("design:type", Object)
], SubmitSelfReviewDto.prototype, "answers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Auto-évaluation globale (note moyenne sur 5)',
        required: false,
        example: 4.2,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SubmitSelfReviewDto.prototype, "selfRating", void 0);
//# sourceMappingURL=submit-self-review.dto.js.map