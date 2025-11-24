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
exports.SchoolsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SchoolsService = class SchoolsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSchoolDto) {
        const existing = await this.prisma.school.findUnique({
            where: { code: createSchoolDto.code },
        });
        if (existing) {
            throw new common_1.ConflictException('Ya existe un colegio con ese código');
        }
        return this.prisma.school.create({
            data: createSchoolDto,
        });
    }
    async findAll() {
        return this.prisma.school.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        children: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const school = await this.prisma.school.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        role: true,
                        status: true,
                    },
                },
                _count: {
                    select: {
                        children: true,
                        devices: true,
                    },
                },
            },
        });
        if (!school) {
            throw new common_1.NotFoundException('Colegio no encontrado');
        }
        return school;
    }
    async update(id, updateSchoolDto) {
        await this.findOne(id);
        if (updateSchoolDto.code) {
            const existing = await this.prisma.school.findUnique({
                where: { code: updateSchoolDto.code },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Ya existe un colegio con ese código');
            }
        }
        return this.prisma.school.update({
            where: { id },
            data: updateSchoolDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.school.delete({
            where: { id },
        });
    }
};
exports.SchoolsService = SchoolsService;
exports.SchoolsService = SchoolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchoolsService);
//# sourceMappingURL=schools.service.js.map