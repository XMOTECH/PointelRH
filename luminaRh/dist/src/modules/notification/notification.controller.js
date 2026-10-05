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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("./notification.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let NotificationController = class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async findAll(userId) {
        const notifications = await this.notificationService.findAllForUser(userId);
        return {
            success: true,
            data: notifications,
        };
    }
    async markAllAsRead(userId) {
        await this.notificationService.markAllAsRead(userId);
        return {
            success: true,
            message: 'Toutes les notifications ont été marquées comme lues',
        };
    }
    async markAsRead(userId, id) {
        const notification = await this.notificationService.markAsRead(userId, id);
        return {
            success: true,
            data: notification,
        };
    }
    async remove(userId, id) {
        await this.notificationService.remove(userId, id);
        return {
            success: true,
            message: 'Notification supprimée avec succès',
        };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les notifications de l\'utilisateur connecté' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des notifications récupérée avec succès.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('read-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer toutes les notifications comme lues' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Toutes les notifications marquées comme lues.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer une notification comme lue' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marquée comme lue.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:employee', 'realm:admin', 'realm:manager', 'realm:super_admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une notification' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID de la notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification supprimée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification introuvable.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "remove", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)('keycloak-token'),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map