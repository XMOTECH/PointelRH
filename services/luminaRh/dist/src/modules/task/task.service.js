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
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TaskService = class TaskService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId, filters) {
        const tasks = await this.prisma.task.findMany({
            where: {
                employee: filters.employeeId || filters.departmentId ? {
                    id: filters.employeeId,
                    departmentId: filters.departmentId,
                    companyId,
                } : {
                    companyId,
                },
                missionId: filters.missionId,
                status: filters.status,
            },
            include: {
                employee: true,
                mission: true,
                comments: {
                    include: {
                        employee: true,
                        attachments: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
                attachments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return tasks.map(t => this.mapToTaskResource(t));
    }
    async create(companyId, creatorId, dto) {
        const assignee = await this.prisma.employee.findFirst({
            where: { id: dto.assigned_to, companyId },
        });
        if (!assignee) {
            throw new common_1.NotFoundException('Employé assigné introuvable dans cette entreprise');
        }
        const task = await this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                priority: dto.priority || 'medium',
                status: 'todo',
                employeeId: dto.assigned_to,
                missionId: dto.mission_id || null,
                dueDate: dto.due_date ? new Date(dto.due_date) : null,
                recurrence: dto.recurrence || null,
                estimatedMinutes: dto.estimated_minutes || null,
                createdBy: creatorId,
                departmentId: assignee.departmentId,
            },
            include: {
                employee: true,
                mission: true,
                comments: true,
                attachments: true,
            },
        });
        return this.mapToTaskResource(task);
    }
    async update(companyId, id, dto) {
        const task = await this.prisma.task.findFirst({
            where: {
                id,
                employee: { companyId },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tâche introuvable');
        }
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.priority !== undefined)
            updateData.priority = dto.priority;
        if (dto.status !== undefined) {
            updateData.status = dto.status;
            if (dto.status === 'done') {
                updateData.completedAt = new Date();
            }
            else {
                updateData.completedAt = null;
            }
        }
        if (dto.assigned_to !== undefined) {
            const assignee = await this.prisma.employee.findFirst({
                where: { id: dto.assigned_to, companyId },
            });
            if (!assignee) {
                throw new common_1.NotFoundException('Employé assigné introuvable dans cette entreprise');
            }
            updateData.employeeId = dto.assigned_to;
            updateData.departmentId = assignee.departmentId;
        }
        if (dto.mission_id !== undefined)
            updateData.missionId = dto.mission_id || null;
        if (dto.due_date !== undefined)
            updateData.dueDate = dto.due_date ? new Date(dto.due_date) : null;
        if (dto.recurrence !== undefined)
            updateData.recurrence = dto.recurrence || null;
        if (dto.estimated_minutes !== undefined)
            updateData.estimatedMinutes = dto.estimated_minutes || null;
        if (dto.actual_minutes !== undefined)
            updateData.actualMinutes = dto.actual_minutes;
        const updated = await this.prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                employee: true,
                mission: true,
                comments: {
                    include: {
                        employee: true,
                        attachments: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
                attachments: true,
            },
        });
        return this.mapToTaskResource(updated);
    }
    async remove(companyId, id) {
        const task = await this.prisma.task.findFirst({
            where: {
                id,
                employee: { companyId },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tâche introuvable');
        }
        await this.prisma.task.delete({ where: { id } });
        return { success: true };
    }
    async findMyTasks(employeeId, status) {
        const tasks = await this.prisma.task.findMany({
            where: {
                employeeId,
                status: status || undefined,
            },
            include: {
                employee: true,
                mission: true,
                comments: {
                    include: {
                        employee: true,
                        attachments: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
                attachments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return tasks.map(t => this.mapToTaskResource(t));
    }
    async updateMyTaskStatus(employeeId, id, status) {
        const task = await this.prisma.task.findFirst({
            where: { id, employeeId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tâche introuvable ou ne vous appartient pas');
        }
        const updated = await this.prisma.task.update({
            where: { id },
            data: {
                status,
                completedAt: status === 'done' ? new Date() : null,
            },
            include: {
                employee: true,
                mission: true,
                comments: {
                    include: {
                        employee: true,
                        attachments: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
                attachments: true,
            },
        });
        return this.mapToTaskResource(updated);
    }
    async logTime(employeeId, id, minutes) {
        const task = await this.prisma.task.findFirst({
            where: { id, employeeId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tâche introuvable ou ne vous appartient pas');
        }
        const updated = await this.prisma.task.update({
            where: { id },
            data: {
                actualMinutes: { increment: minutes },
            },
        });
        return {
            actual_minutes: updated.actualMinutes,
        };
    }
    async createMyTask(employeeId, companyId, missionId, dto) {
        const assignment = await this.prisma.missionAssignment.findFirst({
            where: { missionId, employeeId },
        });
        if (!assignment) {
            throw new common_1.ForbiddenException('Vous n\'êtes pas autorisé à créer une tâche sur cette mission car vous n\'y êtes pas affecté');
        }
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        const task = await this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description || null,
                priority: dto.priority || 'medium',
                status: 'todo',
                employeeId,
                missionId,
                dueDate: dto.due_date ? new Date(dto.due_date) : null,
                estimatedMinutes: dto.estimated_minutes || null,
                createdBy: employeeId,
                departmentId: employee?.departmentId || null,
            },
            include: {
                employee: true,
                mission: true,
                comments: true,
                attachments: true,
            },
        });
        return this.mapToTaskResource(task);
    }
    async updateMyTask(employeeId, id, dto) {
        const task = await this.prisma.task.findFirst({
            where: { id, employeeId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tâche introuvable ou ne vous appartient pas');
        }
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.priority !== undefined)
            updateData.priority = dto.priority;
        if (dto.status !== undefined) {
            updateData.status = dto.status;
            if (dto.status === 'done') {
                updateData.completedAt = new Date();
            }
            else {
                updateData.completedAt = null;
            }
        }
        if (dto.due_date !== undefined)
            updateData.dueDate = dto.due_date ? new Date(dto.due_date) : null;
        if (dto.estimated_minutes !== undefined)
            updateData.estimatedMinutes = dto.estimated_minutes || null;
        const updated = await this.prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                employee: true,
                mission: true,
                comments: {
                    include: {
                        employee: true,
                        attachments: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
                attachments: true,
            },
        });
        return this.mapToTaskResource(updated);
    }
    async addComment(taskId, employeeId, content, attachments) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tâche introuvable');
        }
        const comment = await this.prisma.taskComment.create({
            data: {
                taskId,
                employeeId,
                content,
            },
            include: {
                employee: true,
                attachments: true,
            },
        });
        if (attachments && attachments.length > 0) {
            const createdAttachments = await Promise.all(attachments.map(att => this.prisma.taskAttachment.create({
                data: {
                    commentId: comment.id,
                    fileName: att.fileName || att.name,
                    fileType: att.fileType || 'document',
                    fileSize: att.fileSize || 0,
                    url: att.url || '',
                },
            })));
            comment.attachments = createdAttachments;
        }
        return {
            id: comment.id,
            content: comment.content,
            employee_name: comment.employee ? `${comment.employee.firstName} ${comment.employee.lastName}` : 'Système',
            attachment_path: comment.attachmentPath,
            attachments: comment.attachments.map(att => ({
                id: att.id,
                file_name: att.fileName,
                file_type: att.fileType,
                file_size: att.fileSize,
                url: att.url,
            })),
            created_at: comment.createdAt.toISOString(),
        };
    }
    mapToTaskResource(t) {
        return {
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: t.status,
            due_date: t.dueDate ? t.dueDate.toISOString() : null,
            recurrence: t.recurrence,
            estimated_minutes: t.estimatedMinutes,
            actual_minutes: t.actualMinutes,
            completed_at: t.completedAt ? t.completedAt.toISOString() : null,
            assigned_to: t.employeeId,
            assignee_name: t.employee ? `${t.employee.firstName} ${t.employee.lastName}` : null,
            created_by: t.createdBy,
            creator_name: t.createdBy ? 'Manager' : null,
            department_id: t.departmentId,
            mission_id: t.missionId,
            mission_title: t.mission ? t.mission.title : null,
            comments: t.comments ? t.comments.map((c) => ({
                id: c.id,
                content: c.content,
                employee_name: c.employee ? `${c.employee.firstName} ${c.employee.lastName}` : 'Système',
                attachment_path: c.attachmentPath,
                attachments: c.attachments ? c.attachments.map((att) => ({
                    id: att.id,
                    file_name: att.fileName,
                    file_type: att.fileType,
                    file_size: att.fileSize,
                    url: att.url,
                })) : [],
                created_at: c.createdAt.toISOString(),
            })) : [],
            created_at: t.createdAt.toISOString(),
            updated_at: t.updatedAt.toISOString(),
        };
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskService);
//# sourceMappingURL=task.service.js.map