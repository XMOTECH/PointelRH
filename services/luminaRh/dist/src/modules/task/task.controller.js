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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const task_service_1 = require("./task.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TaskController = class TaskController {
    taskService;
    constructor(taskService) {
        this.taskService = taskService;
    }
    async findAll(companyId, departmentId, missionId, employeeId, status) {
        const tasks = await this.taskService.findAll(companyId, { departmentId, missionId, employeeId, status });
        return {
            success: true,
            data: tasks,
        };
    }
    async create(companyId, userId, dto) {
        const task = await this.taskService.create(companyId, userId, dto);
        return {
            success: true,
            data: task,
        };
    }
    async update(companyId, id, dto) {
        const task = await this.taskService.update(companyId, id, dto);
        return {
            success: true,
            data: task,
        };
    }
    async remove(companyId, id) {
        await this.taskService.remove(companyId, id);
        return {
            success: true,
            message: 'Tâche supprimée avec succès',
        };
    }
    async addComment(id, userId, content, attachments) {
        const comment = await this.taskService.addComment(id, userId, content, attachments);
        return {
            success: true,
            data: comment,
        };
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister toutes les tâches', description: 'Récupère toutes les tâches de l\'entreprise avec possibilité de filtres.' }),
    (0, swagger_1.ApiQuery)({ name: 'department_id', required: false, description: 'ID du département' }),
    (0, swagger_1.ApiQuery)({ name: 'mission_id', required: false, description: 'ID de la mission' }),
    (0, swagger_1.ApiQuery)({ name: 'employee_id', required: false, description: 'ID de l\'employé assigné' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Statut de la tâche' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des tâches récupérée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('department_id')),
    __param(2, (0, common_1.Query)('mission_id')),
    __param(3, (0, common_1.Query)('employee_id')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une tâche', description: 'Crée et assigne une nouvelle tâche à un employé.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tâche créée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour une tâche', description: 'Met à jour les données d\'une tâche existante.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la tâche' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tâche mise à jour.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une tâche', description: 'Supprime une tâche définitivement.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la tâche' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tâche supprimée.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter un commentaire', description: 'Ajoute un commentaire à la tâche avec pièces jointes éventuelles.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la tâche' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Commentaire ajouté.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)('content')),
    __param(3, (0, common_1.Body)('attachments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Array]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "addComment", null);
exports.TaskController = TaskController = __decorate([
    (0, swagger_1.ApiTags)('Tasks (Manager)'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
//# sourceMappingURL=task.controller.js.map