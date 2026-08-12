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
exports.MissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MissionService = class MissionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId, filters) {
        const missions = await this.prisma.mission.findMany({
            where: {
                companyId,
                departmentId: filters.departmentId,
                status: filters.status,
            },
            include: {
                department: true,
                assignments: {
                    include: {
                        employee: true,
                    },
                },
                tasks: true,
                documents: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return missions.map(m => this.mapToMissionResource(m));
    }
    async findOne(companyId, id) {
        const mission = await this.prisma.mission.findFirst({
            where: { id, companyId },
            include: {
                department: true,
                assignments: {
                    include: {
                        employee: true,
                    },
                },
                tasks: {
                    include: {
                        employee: true,
                    },
                },
                documents: true,
            },
        });
        if (!mission) {
            throw new common_1.NotFoundException('Mission introuvable');
        }
        return this.mapToMissionResource(mission);
    }
    async create(companyId, dto) {
        const mission = await this.prisma.mission.create({
            data: {
                companyId,
                title: dto.title,
                description: dto.description || null,
                location: dto.location || null,
                status: dto.status || 'draft',
                startDate: new Date(dto.start_date),
                endDate: dto.end_date ? new Date(dto.end_date) : null,
                departmentId: dto.department_id || null,
            },
        });
        if (dto.employee_ids && dto.employee_ids.length > 0) {
            await Promise.all(dto.employee_ids.map(empId => this.prisma.missionAssignment.create({
                data: {
                    missionId: mission.id,
                    employeeId: empId,
                },
            }).catch(() => null)));
        }
        return this.findOne(companyId, mission.id);
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.location !== undefined)
            updateData.location = dto.location;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.start_date !== undefined)
            updateData.startDate = new Date(dto.start_date);
        if (dto.end_date !== undefined)
            updateData.endDate = dto.end_date ? new Date(dto.end_date) : null;
        if (dto.department_id !== undefined)
            updateData.departmentId = dto.department_id || null;
        await this.prisma.mission.update({
            where: { id },
            data: updateData,
        });
        if (dto.employee_ids !== undefined) {
            await this.prisma.missionAssignment.deleteMany({
                where: { missionId: id },
            });
            if (dto.employee_ids.length > 0) {
                await Promise.all(dto.employee_ids.map(empId => this.prisma.missionAssignment.create({
                    data: {
                        missionId: id,
                        employeeId: empId,
                    },
                }).catch(() => null)));
            }
        }
        return this.findOne(companyId, id);
    }
    async assignEmployees(companyId, id, employeeIds, comment) {
        await this.findOne(companyId, id);
        await Promise.all(employeeIds.map(empId => this.prisma.missionAssignment.create({
            data: {
                missionId: id,
                employeeId: empId,
            },
        }).catch(() => null)));
        return { success: true, message: 'Employés assignés avec succès' };
    }
    async remove(companyId, id) {
        await this.findOne(companyId, id);
        await this.prisma.mission.delete({
            where: { id },
        });
        return { success: true };
    }
    async findMyMissions(employeeId) {
        const assignments = await this.prisma.missionAssignment.findMany({
            where: { employeeId },
            include: {
                mission: {
                    include: {
                        department: true,
                        tasks: true,
                        documents: true,
                    },
                },
            },
        });
        return assignments.map(a => {
            const m = a.mission;
            const totalTasks = m.tasks.length;
            const completedTasks = m.tasks.filter(t => t.status === 'done').length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            return {
                id: m.id,
                title: m.title,
                description: m.description,
                location: m.location,
                status: m.status,
                start_date: m.startDate.toISOString(),
                end_date: m.endDate ? m.endDate.toISOString() : null,
                department: m.department ? m.department.name : null,
                assignment_status: 'assigned',
                comment: null,
                assigned_at: a.createdAt.toISOString(),
                stats: {
                    total_tasks: totalTasks,
                    completed_tasks: completedTasks,
                    progression_percentage: progress,
                },
            };
        });
    }
    async findMyMissionDetail(employeeId, companyId, id) {
        const assignment = await this.prisma.missionAssignment.findFirst({
            where: { missionId: id, employeeId },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Mission introuvable ou vous n\'y êtes pas assigné');
        }
        const mission = await this.prisma.mission.findUnique({
            where: { id },
            include: {
                department: true,
                tasks: {
                    include: {
                        employee: true,
                        comments: {
                            include: {
                                employee: true,
                                attachments: true,
                            },
                            orderBy: { createdAt: 'asc' },
                        },
                        attachments: true,
                    },
                },
                documents: true,
                assignments: {
                    include: {
                        employee: true,
                    },
                },
            },
        });
        if (!mission) {
            throw new common_1.NotFoundException('Mission introuvable');
        }
        const coworkers = mission.assignments
            .filter(a => a.employeeId !== employeeId)
            .map(a => ({
            id: a.employee.id,
            first_name: a.employee.firstName,
            last_name: a.employee.lastName,
            role: a.employee.contractType,
        }));
        const totalTasks = mission.tasks.length;
        const completedTasks = mission.tasks.filter(t => t.status === 'done').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const myTasks = mission.tasks.filter(t => t.employeeId === employeeId);
        const myTasksTotal = myTasks.length;
        const myTasksCompleted = myTasks.filter(t => t.status === 'done').length;
        return {
            id: mission.id,
            title: mission.title,
            description: mission.description,
            location: mission.location,
            status: mission.status,
            start_date: mission.startDate.toISOString(),
            end_date: mission.endDate ? mission.endDate.toISOString() : null,
            department: mission.department ? { id: mission.department.id, name: mission.department.name } : null,
            stats: {
                total_tasks: totalTasks,
                completed_tasks: completedTasks,
                progression_percentage: progress,
                my_tasks_total: myTasksTotal,
                my_tasks_completed: myTasksCompleted,
            },
            my_tasks: myTasks.map(t => ({
                id: t.id,
                title: t.title,
                description: t.description,
                priority: t.priority,
                status: t.status,
                due_date: t.dueDate ? t.dueDate.toISOString() : null,
                estimated_minutes: t.estimatedMinutes,
                actual_minutes: t.actualMinutes,
                completed_at: t.completedAt ? t.completedAt.toISOString() : null,
                creator_name: t.createdBy ? 'Manager' : null,
                comments: t.comments.map((c) => ({
                    id: c.id,
                    content: c.content,
                    employee_name: c.employee ? `${c.employee.firstName} ${c.employee.lastName}` : 'Système',
                    attachments: c.attachments.map((att) => ({
                        id: att.id,
                        file_name: att.fileName,
                        file_type: att.fileType,
                        file_size: att.fileSize,
                        url: att.url,
                    })),
                    created_at: c.createdAt.toISOString(),
                })),
                created_at: t.createdAt.toISOString(),
                updated_at: t.updatedAt.toISOString(),
            })),
            documents: mission.documents.map(d => ({
                id: d.id,
                file_name: d.fileName,
                file_type: d.fileType,
                file_size: d.fileSize,
                url: d.url,
                uploaded_by_name: d.uploadedByName,
                created_at: d.createdAt.toISOString(),
            })),
            coworkers,
        };
    }
    async uploadDocuments(companyId, missionId, files) {
        await this.findOne(companyId, missionId);
        const docs = await Promise.all(files.map(file => this.prisma.missionDocument.create({
            data: {
                missionId,
                fileName: file.fileName || file.name,
                fileType: file.fileType || 'document',
                fileSize: file.fileSize || 0,
                url: file.url || '',
                uploadedByName: file.uploadedByName || 'Manager',
            },
        })));
        return docs.map(d => ({
            id: d.id,
            file_name: d.fileName,
            file_type: d.fileType,
            file_size: d.fileSize,
            url: d.url,
            uploaded_by_name: d.uploadedByName,
            created_at: d.createdAt.toISOString(),
        }));
    }
    async deleteDocument(companyId, missionId, docId) {
        await this.findOne(companyId, missionId);
        const doc = await this.prisma.missionDocument.findFirst({
            where: { id: docId, missionId },
        });
        if (!doc) {
            throw new common_1.NotFoundException('Document de mission introuvable');
        }
        await this.prisma.missionDocument.delete({ where: { id: docId } });
        return { success: true };
    }
    mapToMissionResource(m) {
        const totalTasks = m.tasks ? m.tasks.length : 0;
        const completedTasks = m.tasks ? m.tasks.filter((t) => t.status === 'done').length : 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return {
            id: m.id,
            title: m.title,
            description: m.description,
            location: m.location,
            status: m.status,
            start_date: m.startDate.toISOString(),
            end_date: m.endDate ? m.endDate.toISOString() : null,
            department_id: m.departmentId,
            department: m.department ? {
                id: m.department.id,
                name: m.department.name,
            } : undefined,
            employees: m.assignments ? m.assignments.map((a) => ({
                id: a.employee.id,
                firstName: a.employee.firstName,
                lastName: a.employee.lastName,
                email: a.employee.email,
                status: a.employee.status,
            })) : [],
            documents: m.documents ? m.documents.map((d) => ({
                id: d.id,
                file_name: d.fileName,
                file_type: d.fileType,
                file_size: d.fileSize,
                url: d.url,
                uploaded_by_name: d.uploadedByName,
                created_at: d.createdAt.toISOString(),
            })) : [],
            stats: {
                total_tasks: totalTasks,
                completed_tasks: completedTasks,
                progression_percentage: progress,
            },
            created_at: m.createdAt.toISOString(),
            updated_at: m.updatedAt.toISOString(),
        };
    }
};
exports.MissionService = MissionService;
exports.MissionService = MissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MissionService);
//# sourceMappingURL=mission.service.js.map