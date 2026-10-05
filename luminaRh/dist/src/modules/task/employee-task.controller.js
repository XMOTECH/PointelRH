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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeTaskController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const task_service_1 = require("./task.service");
const create_my_task_dto_1 = require("./dto/create-my-task.dto");
const update_my_task_dto_1 = require("./dto/update-my-task.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let EmployeeTaskController = class EmployeeTaskController {
    taskService;
    constructor(taskService) {
        this.taskService = taskService;
    }
    async findMyTasks(user, status) {
        if (!user.employeeId) {
            return { success: true, data: [] };
        }
        const tasks = await this.taskService.findMyTasks(user.employeeId, status);
        return {
            success: true,
            data: tasks,
        };
    }
    async updateMyTaskStatus(user, id, status) {
        if (!user.employeeId) {
            throw new Error('Aucun profil employé associé à cette session');
        }
        const task = await this.taskService.updateMyTaskStatus(user.employeeId, id, status);
        return {
            success: true,
            data: task,
        };
    }
    async logTime(user, id, minutes) {
        if (!user.employeeId) {
            throw new Error('Aucun profil employé associé à cette session');
        }
        const result = await this.taskService.logTime(user.employeeId, id, minutes);
        return {
            success: true,
            data: result,
        };
    }
    async createMyTask(user, missionId, dto) {
        if (!user.employeeId) {
            throw new Error('Aucun profil employé associé à cette session');
        }
        const task = await this.taskService.createMyTask(user.employeeId, user.companyId, missionId, dto);
        return {
            success: true,
            data: task,
        };
    }
    async updateMyTask(user, id, dto) {
        if (!user.employeeId) {
            throw new Error('Aucun profil employé associé à cette session');
        }
        const task = await this.taskService.updateMyTask(user.employeeId, id, dto);
        return {
            success: true,
            data: task,
        };
    }
    async addMyComment(user, id, content, attachments) {
        if (!user.employeeId) {
            throw new Error('Aucun profil employé associé à cette session');
        }
        const comment = await this.taskService.addComment(id, user.employeeId, content, attachments);
        return {
            success: true,
            data: comment,
        };
    }
};
exports.EmployeeTaskController = EmployeeTaskController;
__decorate([
    (0, common_1.Get)('my-tasks'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister mes tâches personnelles', description: 'Récupère toutes les tâches assignées à l\'employé connecté.' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filtrer par statut' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tâches récupérées.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String]),
    __metadata("design:returntype", Promise)
], EmployeeTaskController.prototype, "findMyTasks", null);
__decorate([
    (0, common_1.Patch)('my-tasks/:id/status'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le statut d\'une de mes tâches', description: 'Permet à l\'employé de changer l\'état (todo, in_progress, done) de sa tâche.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la tâche' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statut mis à jour.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeTaskController.prototype, "updateMyTaskStatus", null);
__decorate([
    (0, common_1.Post)('my-tasks/:id/timer'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer du temps de travail sur une tâche', description: 'Ajoute des minutes passées au total réel de travail accompli sur cette tâche.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la tâche' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Temps enregistré.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('minutes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, Number]),
    __metadata("design:returntype", Promise)
], EmployeeTaskController.prototype, "logTime", null);
__decorate([
    (0, common_1.Post)('my-missions/:missionId/tasks'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une tâche personnelle sous une mission', description: 'Crée une sous-tâche liée à une mission spécifique à laquelle l\'employé collabore.' }),
    (0, swagger_1.ApiParam)({ name: 'missionId', description: 'UUID de la mission associée' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tâche créée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('missionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, create_my_task_dto_1.CreateMyTaskDto]),
    __metadata("design:returntype", Promise)
], EmployeeTaskController.prototype, "createMyTask", null);
__decorate([
    (0, common_1.Patch)('my-tasks/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour les détails d\'une de mes tâches', description: 'Met à jour le titre, description, priorité ou estimation de temps de la tâche de l\'employé.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la tâche' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tâche mise à jour.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, update_my_task_dto_1.UpdateMyTaskDto]),
    __metadata("design:returntype", Promise)
], EmployeeTaskController.prototype, "updateMyTask", null);
__decorate([
    (0, common_1.Post)('my-tasks/:id/comments'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Commenter ma tâche', description: 'Ajoute un commentaire ou compte-rendu textuel sur la tâche.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la tâche' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Commentaire ajouté.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('content')),
    __param(3, (0, common_1.Body)('attachments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.CurrentUserDto, String, String, Array]),
    __metadata("design:returntype", Promise)
], EmployeeTaskController.prototype, "addMyComment", null);
exports.EmployeeTaskController = EmployeeTaskController = __decorate([
    (0, swagger_1.ApiTags)('Tasks (Employee)'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('employee'),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], EmployeeTaskController);
//# sourceMappingURL=employee-task.controller.js.map