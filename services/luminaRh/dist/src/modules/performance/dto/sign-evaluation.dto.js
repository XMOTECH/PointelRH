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
exports.SignEvaluationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SignEvaluationDto {
    signerRole;
    finalComment;
}
exports.SignEvaluationDto = SignEvaluationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rôle du signataire (EMPLOYEE ou MANAGER)',
        example: 'EMPLOYEE',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SignEvaluationDto.prototype, "signerRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Commentaire final du signataire (facultatif)',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SignEvaluationDto.prototype, "finalComment", void 0);
//# sourceMappingURL=sign-evaluation.dto.js.map