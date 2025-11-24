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
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TrackingService = class TrackingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async savePosition(createPositionDto) {
        const { childId, lat, lng, ...otherData } = createPositionDto;
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
            include: {
                school: true,
                parent: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        if (!child) {
            throw new common_1.NotFoundException('Hijo no encontrado');
        }
        const position = await this.prisma.$queryRaw `
      INSERT INTO "sig"."child_positions" 
        (school_id, child_id, lat, lng, accuracy, speed, heading, altitude, geom, created_at)
      VALUES 
        (
          ${child.schoolId}::int,
          ${childId}::int,
          ${lat}::double precision,
          ${lng}::double precision,
          ${otherData.accuracy || null}::double precision,
          ${otherData.speed || null}::double precision,
          ${otherData.heading || null}::double precision,
          ${otherData.altitude || null}::double precision,
          ST_SetSRID(ST_MakePoint(${lng}::double precision, ${lat}::double precision), 4326),
          NOW()
        )
      RETURNING id, school_id, child_id, lat, lng, created_at
    `;
        const savedPosition = position[0];
        const withinCheck = await this.prisma.$queryRaw `
      SELECT 
        COALESCE(
          ST_Within(
            (SELECT geom FROM "sig"."child_positions" WHERE id = ${savedPosition.id}),
            (SELECT geom FROM "sig"."schools" WHERE id = ${child.schoolId})
          ),
          false
        ) as within
    `;
        const isWithinArea = withinCheck[0]?.within || false;
        const lastAlert = await this.prisma.alert.findFirst({
            where: { childId },
            orderBy: { createdAt: 'desc' },
        });
        let shouldCreateAlert = false;
        let alertType = null;
        let alertMessage = '';
        if (!lastAlert) {
            if (!isWithinArea) {
                shouldCreateAlert = true;
                alertType = 'EXIT_AREA';
                alertMessage = `${child.fullName} está fuera del área del colegio`;
            }
        }
        else {
            const wasInside = lastAlert.type === 'ENTER_AREA';
            const wasOutside = lastAlert.type === 'EXIT_AREA';
            if (wasInside && !isWithinArea) {
                shouldCreateAlert = true;
                alertType = 'EXIT_AREA';
                alertMessage = `¡ALERTA! ${child.fullName} ha salido del área segura del colegio`;
            }
            else if (wasOutside && isWithinArea) {
                shouldCreateAlert = true;
                alertType = 'ENTER_AREA';
                alertMessage = `${child.fullName} ha ingresado al área del colegio`;
            }
        }
        let alert = null;
        if (shouldCreateAlert && alertType) {
            alert = await this.prisma.alert.create({
                data: {
                    schoolId: child.schoolId,
                    childId,
                    positionId: savedPosition.id,
                    type: alertType,
                    message: alertMessage,
                },
            });
        }
        return {
            position: {
                id: savedPosition.id,
                childId: savedPosition.child_id,
                lat,
                lng,
                ...otherData,
                createdAt: savedPosition.created_at,
            },
            isWithinArea,
            alertCreated: !!alert,
            alert: alert || undefined,
        };
    }
    async getChildLastPosition(childId) {
        const position = await this.prisma.childPosition.findFirst({
            where: { childId },
            orderBy: { createdAt: 'desc' },
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
        if (!position) {
            throw new common_1.NotFoundException('No se encontraron posiciones para este hijo');
        }
        return position;
    }
    async getChildPositionHistory(childId, limit = 50) {
        return this.prisma.childPosition.findMany({
            where: { childId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                lat: true,
                lng: true,
                accuracy: true,
                speed: true,
                heading: true,
                altitude: true,
                createdAt: true,
            },
        });
    }
    async getAllChildrenLastPositions(schoolId) {
        const positions = await this.prisma.$queryRaw `
      SELECT DISTINCT ON (c.id)
        c.id as child_id,
        c.full_name,
        c.grade,
        cp.lat,
        cp.lng,
        cp.created_at
      FROM "sig"."children" c
      LEFT JOIN "sig"."child_positions" cp ON cp.child_id = c.id
      WHERE c.school_id = ${schoolId}
        AND c.status = 'ACTIVE'
      ORDER BY c.id, cp.created_at DESC
    `;
        return positions;
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map