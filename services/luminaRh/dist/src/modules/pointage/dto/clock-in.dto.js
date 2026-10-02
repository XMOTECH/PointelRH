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
exports.ClockInDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ClockInDto {
    channel;
    payload;
    company_id;
    companyId;
    latitude;
    longitude;
}
exports.ClockInDto = ClockInDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'pin',
        description: 'Le canal de pointage utilisé (pin, qr, face)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le canal de pointage est requis (pin, qr, face)' }),
    __metadata("design:type", String)
], ClockInDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { pin: '1234' },
        description: 'Le payload contenant les données d\'identification nécessaires (ex: { pin: "1234" } ou { token: "uuid-du-qr" })',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le contenu du pointage (payload) est requis' }),
    __metadata("design:type", Object)
], ClockInDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'uuid-company',
        description: 'UUID de l\'entreprise',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ClockInDto.prototype, "company_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'uuid-company',
        description: 'UUID de l\'entreprise (camelCase)',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ClockInDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 14.6937,
        description: 'La latitude de géolocalisation actuelle du terminal de pointage',
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ClockInDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: -17.4441,
        description: 'La longitude de géolocalisation actuelle du terminal de pointage',
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ClockInDto.prototype, "longitude", void 0);
//# sourceMappingURL=clock-in.dto.js.map