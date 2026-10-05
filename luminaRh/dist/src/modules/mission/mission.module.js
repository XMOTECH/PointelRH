"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionModule = void 0;
const common_1 = require("@nestjs/common");
const mission_service_1 = require("./mission.service");
const mission_controller_1 = require("./mission.controller");
const employee_mission_controller_1 = require("./employee-mission.controller");
let MissionModule = class MissionModule {
};
exports.MissionModule = MissionModule;
exports.MissionModule = MissionModule = __decorate([
    (0, common_1.Module)({
        controllers: [mission_controller_1.MissionController, employee_mission_controller_1.EmployeeMissionController],
        providers: [mission_service_1.MissionService],
        exports: [mission_service_1.MissionService],
    })
], MissionModule);
//# sourceMappingURL=mission.module.js.map