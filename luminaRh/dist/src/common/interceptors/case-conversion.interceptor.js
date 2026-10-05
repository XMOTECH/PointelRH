"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseConversionInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const case_converter_1 = require("../utils/case-converter");
let CaseConversionInterceptor = class CaseConversionInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        if (request.body && typeof request.body === 'object') {
            request.body = (0, case_converter_1.toCamelCase)(request.body);
        }
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data && typeof data === 'object') {
                return (0, case_converter_1.toSnakeCase)(data);
            }
            return data;
        }));
    }
};
exports.CaseConversionInterceptor = CaseConversionInterceptor;
exports.CaseConversionInterceptor = CaseConversionInterceptor = __decorate([
    (0, common_1.Injectable)()
], CaseConversionInterceptor);
//# sourceMappingURL=case-conversion.interceptor.js.map