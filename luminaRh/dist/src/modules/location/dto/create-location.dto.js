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
exports.CreateLocationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateLocationDto {
    name;
    address;
    latitude;
    longitude;
    radius_meters;
    is_active;
}
exports.CreateLocationDto = CreateLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Siège Social Dakar', description: 'Nom du site géographique de pointage' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le nom du site est requis' }),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Route de la VDN, Dakar', description: 'Adresse physique du site', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 14.7245, description: 'Latitude géographique du site' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La latitude est requise' }),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -17.4578, description: 'Longitude géographique du site' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La longitude est requise' }),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150.0, description: 'Rayon de géofencing autorisé (en mètres)', default: 100.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le rayon de géofencing est requis' }),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "radius_meters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'État d\'activité du site', default: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLocationDto.prototype, "is_active", void 0);
//# sourceMappingURL=create-location.dto.js.map