"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeModule = void 0;
const common_1 = require("@nestjs/common");
const employee_service_1 = require("./employee.service");
const employee_controller_1 = require("./employee.controller");
const employee_me_controller_1 = require("./employee-me.controller");
const advance_service_1 = require("./advance.service");
const advance_controller_1 = require("./advance.controller");
let EmployeeModule = class EmployeeModule {
};
exports.EmployeeModule = EmployeeModule;
exports.EmployeeModule = EmployeeModule = __decorate([
    (0, common_1.Module)({
        controllers: [advance_controller_1.AdvanceController, employee_me_controller_1.EmployeeMeController, employee_controller_1.EmployeeController],
        providers: [employee_service_1.EmployeeService, advance_service_1.AdvanceService],
        exports: [employee_service_1.EmployeeService, advance_service_1.AdvanceService],
    })
], EmployeeModule);
//# sourceMappingURL=employee.module.js.map