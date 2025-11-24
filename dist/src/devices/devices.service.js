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
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DevicesService = class DevicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDeviceDto, schoolId) {
        if (createDeviceDto.schoolId !== schoolId) {
            throw new common_1.ForbiddenException('No puedes crear dispositivos en otro colegio');
        }
        const existing = await this.prisma.device.findUnique({
            where: { deviceId: createDeviceDto.deviceId },
        });
        if (existing) {
            throw new common_1.ConflictException('El dispositivo ya está registrado');
        }
        return this.prisma.device.create({
            data: {
                ...createDeviceDto,
                lastSeen: new Date(),
            },
            include: {
                child: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
    }
    async findAll(schoolId) {
        return this.prisma.device.findMany({
            where: { schoolId },
            include: {
                child: {
                    select: {
                        id: true,
                        fullName: true,
                        grade: true,
                    },
                },
            },
        });
    }
    async findOne(id, schoolId) {
        const device = await this.prisma.device.findUnique({
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
            },
        });
        if (!device) {
            throw new common_1.NotFoundException('Dispositivo no encontrado');
        }
        if (device.schoolId !== schoolId) {
            throw new common_1.ForbiddenException('No tienes acceso a este dispositivo');
        }
        return device;
    }
    async update(id, updateDeviceDto, schoolId) {
        await this.findOne(id, schoolId);
        return this.prisma.device.update({
            where: { id },
            data: {
                ...updateDeviceDto,
                lastSeen: new Date(),
            },
            include: {
                child: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
    }
    async remove(id, schoolId) {
        await this.findOne(id, schoolId);
        return this.prisma.device.delete({
            where: { id },
        });
    }
    async linkToChild(deviceId, childId, schoolId) {
        const device = await this.prisma.device.findUnique({
            where: { deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Dispositivo no encontrado');
        }
        if (device.schoolId !== schoolId) {
            throw new common_1.ForbiddenException('No tienes acceso a este dispositivo');
        }
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child || child.schoolId !== schoolId) {
            throw new common_1.NotFoundException('Hijo no encontrado');
        }
        return this.prisma.device.update({
            where: { id: device.id },
            data: { childId },
            include: {
                child: {
                    select: {
                        id: true,
                        fullName: true,
                        grade: true,
                    },
                },
            },
        });
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevicesService);
//# sourceMappingURL=devices.service.js.map