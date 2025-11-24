import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async savePosition(createPositionDto: CreatePositionDto) {
    const { deviceUid, lat, lng, batteryLevel, ...otherData } = createPositionDto;

    // Buscar el dispositivo por deviceUid
    const device = await this.prisma.device.findUnique({
      where: { deviceUid },
      include: {
        child: {
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
        },
      },
    });

    if (!device || !device.child) {
      throw new NotFoundException('Dispositivo no encontrado o no vinculado a un hijo');
    }

    const child = device.child;
    const childId = child.id;

    // Actualizar última batería y última conexión del dispositivo
    await this.prisma.device.update({
      where: { id: device.id },
      data: {
        lastBatteryLevel: batteryLevel,
        lastSeen: new Date(),
      },
    });

    // Crear la posición con geometría PostGIS y nivel de batería
    const position = await this.prisma.$queryRaw<any[]>`
      INSERT INTO "sig"."child_positions" 
        (school_id, child_id, lat, lng, accuracy, speed, heading, altitude, battery_level, geom, created_at)
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
          ${batteryLevel || null}::int,
          ST_SetSRID(ST_MakePoint(${lng}::double precision, ${lat}::double precision), 4326),
          NOW()
        )
      RETURNING id, school_id, child_id, lat, lng, battery_level, created_at
    `;

    const savedPosition = position[0];

    // Verificar si está dentro o fuera del área del colegio usando ST_Within
    const withinCheck = await this.prisma.$queryRaw<
      Array<{ within: boolean }>
    >`
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

    // Obtener la última alerta del niño para verificar cambio de estado
    const lastAlert = await this.prisma.alert.findFirst({
      where: { childId },
      orderBy: { createdAt: 'desc' },
    });

    let shouldCreateAlert = false;
    let alertType: 'EXIT_AREA' | 'ENTER_AREA' | null = null;
    let alertMessage = '';

    // Lógica de detección de cambio de estado
    if (!lastAlert) {
      // Primera posición
      if (!isWithinArea) {
        shouldCreateAlert = true;
        alertType = 'EXIT_AREA';
        alertMessage = `${child.fullName} está fuera del área del colegio`;
      }
    } else {
      // Hay alertas previas, verificar cambio de estado
      const wasInside = lastAlert.type === 'ENTER_AREA';
      const wasOutside = lastAlert.type === 'EXIT_AREA';

      if (wasInside && !isWithinArea) {
        // Estaba dentro, ahora salió
        shouldCreateAlert = true;
        alertType = 'EXIT_AREA';
        alertMessage = `¡ALERTA! ${child.fullName} ha salido del área segura del colegio`;
      } else if (wasOutside && isWithinArea) {
        // Estaba fuera, ahora entró
        shouldCreateAlert = true;
        alertType = 'ENTER_AREA';
        alertMessage = `${child.fullName} ha ingresado al área del colegio`;
      }
    }

    // Crear alerta si hay cambio de estado
    let alert: any = null;
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

      // TODO: Aquí se puede agregar lógica para enviar notificación FCM al padre
      // await this.sendPushNotification(child.parent, alertMessage);
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

  async getChildLastPosition(childId: number) {
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
      throw new NotFoundException('No se encontraron posiciones para este hijo');
    }

    return position;
  }

  async getChildPositionHistory(
    childId: number,
    limit: number = 50,
  ) {
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

  async getAllChildrenLastPositions(schoolId: number) {
    // Obtener la última posición de cada niño del colegio
    const positions = await this.prisma.$queryRaw<
      Array<{
        child_id: number;
        full_name: string;
        grade: string;
        lat: number;
        lng: number;
        created_at: Date;
      }>
    >`
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
}
