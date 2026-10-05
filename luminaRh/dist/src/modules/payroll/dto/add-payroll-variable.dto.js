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
exports.AddPayrollVariableDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class AddPayrollVariableDto {
    name;
    amount;
    isTaxable = true;
    isSubjectToSocial = true;
}
exports.AddPayrollVariableDto = AddPayrollVariableDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Libellé de la prime ou de la retenue', example: 'Prime de rendement' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddPayrollVariableDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Montant en FCFA', example: 50000 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddPayrollVariableDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indique si la prime est imposable à l\'IR', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AddPayrollVariableDto.prototype, "isTaxable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indique si la prime est soumise aux cotisations IPRES/CSS', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AddPayrollVariableDto.prototype, "isSubjectToSocial", void 0);
//# sourceMappingURL=add-payroll-variable.dto.js.map