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
exports.ReviewDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const onboarding_enums_1 = require("../entities/onboarding.enums");
class ReviewDocumentDto {
    status;
    rejectionReason;
}
exports.ReviewDocumentDto = ReviewDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: [onboarding_enums_1.DocumentStatus.VALIDATED, onboarding_enums_1.DocumentStatus.REJECTED], description: 'Décision de vérification du document' }),
    (0, class_validator_1.IsEnum)(onboarding_enums_1.DocumentStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReviewDocumentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Photo floue, le numéro NIN n\'est pas lisible', description: 'Motif obligatoire en cas de rejet' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReviewDocumentDto.prototype, "rejectionReason", void 0);
//# sourceMappingURL=review-document.dto.js.map