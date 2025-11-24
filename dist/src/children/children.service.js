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
exports.ChildrenService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChildrenService = class ChildrenService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createChildDto, currentUserSchoolId) {
        if (createChildDto.schoolId !== currentUserSchoolId) {
            throw new common_1.ForbiddenException('No puedes crear hijos en otro colegio');
        }
        const parent = await this.prisma.user.findUnique({
            where: { id: createChildDto.parentId },
        });
        if (!parent || parent.schoolId !== currentUserSchoolId) {
            throw new common_1.NotFoundException('Padre no encontrado');
        }
        return this.prisma.child.create({
            data: createChildDto,
            include: {
                parent: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll(schoolId, parentId) {
        return this.prisma.child.findMany({
            where: {
                schoolId,
                ...(parentId && { parentId }),
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                devices: {
                    select: {
                        id: true,
                        deviceName: true,
                        platform: true,
                        status: true,
                        lastSeen: true,
                    },
                },
                _count: {
                    select: {
                        positions: true,
                        alerts: true,
                    },
                },
            },
        });
    }
    async findOne(id, schoolId) {
        const child = await this.prisma.child.findUnique({
            where: { id },
            include: {
                parent: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
                school: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                devices: true,
                positions: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                alerts: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!child) {
            throw new common_1.NotFoundException('Hijo no encontrado');
        }
        if (child.schoolId !== schoolId) {
            throw new common_1.ForbiddenException('No tienes acceso a este hijo');
        }
        return child;
    }
    async update(id, updateChildDto, schoolId) {
        await this.findOne(id, schoolId);
        return this.prisma.child.update({
            where: { id },
            data: updateChildDto,
            include: {
                parent: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async remove(id, schoolId) {
        await this.findOne(id, schoolId);
        return this.prisma.child.delete({
            where: { id },
        });
    }
    async findByParent(parentId, schoolId) {
        return this.prisma.child.findMany({
            where: {
                parentId,
                schoolId,
            },
            include: {
                devices: {
                    select: {
                        id: true,
                        deviceName: true,
                        status: true,
                        lastSeen: true,
                    },
                },
                _count: {
                    select: {
                        alerts: {
                            where: { isRead: false },
                        },
                    },
                },
            },
        });
    }
};
exports.ChildrenService = ChildrenService;
exports.ChildrenService = ChildrenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChildrenService);
//# sourceMappingURL=children.service.js.map