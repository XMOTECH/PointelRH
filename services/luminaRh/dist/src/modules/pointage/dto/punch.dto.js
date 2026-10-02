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
exports.PunchDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PunchDto {
    channel;
    payload;
    action = 'auto';
    company_id;
    companyId;
    latitude;
    longitude;
}
exports.PunchDto = PunchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'pin',
        description: 'Le canal de pointage utilisé (pin, qr, face, web)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le canal de pointage est requis (pin, qr, face, web)' }),
    __metadata("design:type", String)
], PunchDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { pin: '1234' },
        description: 'Données d\'identification (ex: { pin: "1234" }, { descriptor: [...] }, { userId: "..." })',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le contenu du pointage (payload) est requis' }),
    __metadata("design:type", Object)
], PunchDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'auto',
        description: 'Action souhaitée: auto (smart toggle), in (entrée explicite), out (sortie explicite)',
        required: false,
        enum: ['auto', 'in', 'out'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['auto', 'in', 'out']),
    __metadata("design:type", String)
], PunchDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'uuid-company',
        description: 'UUID de l\'entreprise (optionnel si résolu via l\'employé ou le token)',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PunchDto.prototype, "company_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'uuid-company',
        description: 'UUID de l\'entreprise (camelCase)',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PunchDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 14.6937,
        description: 'Latitude GPS actuelle du terminal de pointage',
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PunchDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: -17.4441,
        description: 'Longitude GPS actuelle du terminal de pointage',
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PunchDto.prototype, "longitude", void 0);
//# sourceMappingURL=punch.dto.js.map