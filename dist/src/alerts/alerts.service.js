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
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AlertsService = class AlertsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(schoolId, childId, isRead, type) {
        return this.prisma.alert.findMany({
            where: {
                schoolId,
                ...(childId && { childId }),
                ...(isRead !== undefined && { isRead }),
                ...(type && { type }),
            },
            include: {
                child: {
                    select: {
                        id: true,
                        fullName: true,
                        grade: true,
                    },
                },
                position: {
                    select: {
                        id: true,
                        lat: true,
                        lng: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByParent(parentId, schoolId, isRead) {
        const children = await this.prisma.child.findMany({
            where: {
                parentId,
                schoolId,
            },
            select: { id: true },
        });
        const childIds = children.map((c) => c.id);
        return this.prisma.alert.findMany({
            where: {
                childId: { in: childIds },
                schoolId,
                ...(isRead !== undefined && { isRead }),
            },
            include: {
                child: {
                    select: {
                        id: true,
                        fullName: true,
                        grade: true,
                    },
                },
                position: {
                    select: {
                        id: true,
                        lat: true,
                        lng: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, schoolId) {
        const alert = await this.prisma.alert.findUnique({
            where: { id },
            include: {
                child: {
                    include: {
                        parent: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                },
                position: true,
            },
        });
        if (!alert) {
            throw new common_1.NotFoundException('Alerta no encontrada');
        }
        if (alert.schoolId !== schoolId) {
            throw new common_1.NotFoundException('No tienes acceso a esta alerta');
        }
        return alert;
    }
    async markAsRead(id, schoolId) {
        await this.findOne(id, schoolId);
        return this.prisma.alert.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
    async markAllAsRead(schoolId, parentId) {
        if (parentId) {
            const children = await this.prisma.child.findMany({
                where: { parentId, schoolId },
                select: { id: true },
            });
            const childIds = children.map((c) => c.id);
            return this.prisma.alert.updateMany({
                where: {
                    childId: { in: childIds },
                    schoolId,
                    isRead: false,
                },
                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
        }
        return this.prisma.alert.updateMany({
            where: {
                schoolId,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
    async getUnreadCount(schoolId, parentId) {
        if (parentId) {
            const children = await this.prisma.child.findMany({
                where: { parentId, schoolId },
                select: { id: true },
            });
            const childIds = children.map((c) => c.id);
            return this.prisma.alert.count({
                where: {
                    childId: { in: childIds },
                    schoolId,
                    isRead: false,
                },
            });
        }
        return this.prisma.alert.count({
            where: {
                schoolId,
                isRead: false,
            },
        });
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map