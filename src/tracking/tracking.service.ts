import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

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
          public.ST_SetSRID(public.ST_MakePoint(${lng}::double precision, ${lat}::double precision), 4326),
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
          public.ST_Within(
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

      // Enviar notificación push al padre
      await this.sendPushToParent(
        child.parent.id,
        child.fullName,
        alertType,
        alert.id,
        childId,
        child.schoolId,
        { lat, lng },
      );
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
    // Umbral para considerar "sin señal" (30 minutos sin actualizar)
    const STALE_THRESHOLD_MINUTES = 30;

    // Obtener la última posición de cada niño del colegio
    // Incluye verificación de si está dentro del geofence
    const positions = await this.prisma.$queryRaw<
      Array<{
        child_id: number;
        full_name: string;
        grade: string | null;
        lat: number | null;
        lng: number | null;
        accuracy: number | null;
        battery_level: number | null;
        created_at: Date | null;
        is_inside_geofence: boolean | null;
        minutes_since_update: number | null;
      }>
    >`
      SELECT DISTINCT ON (c.id)
        c.id as child_id,
        c.full_name,
        c.grade,
        cp.lat,
        cp.lng,
        cp.accuracy,
        cp.battery_level,
        cp.created_at,
        CASE 
          WHEN cp.geom IS NULL THEN NULL
          ELSE COALESCE(
            public.ST_Within(
              cp.geom,
              (SELECT geom FROM "sig"."schools" WHERE id = ${schoolId})
            ),
            false
          )
        END as is_inside_geofence,
        CASE 
          WHEN cp.created_at IS NULL THEN NULL
          ELSE EXTRACT(EPOCH FROM (NOW() - cp.created_at)) / 60
        END as minutes_since_update
      FROM "sig"."children" c
      LEFT JOIN "sig"."child_positions" cp ON cp.child_id = c.id
      WHERE c.school_id = ${schoolId}
        AND c.status = 'ACTIVE'
      ORDER BY c.id, cp.created_at DESC
    `;

    // Transformar y agregar status
    return positions.map((p) => {
      // Determinar si tiene señal activa
      const hasPosition = p.lat !== null && p.lng !== null;
      const isStale = p.minutes_since_update !== null && p.minutes_since_update > STALE_THRESHOLD_MINUTES;
      const hasSignal = hasPosition && !isStale;

      // Determinar status: 'inside' | 'outside' | 'no_signal'
      let status: 'inside' | 'outside' | 'no_signal';
      if (!hasSignal) {
        status = 'no_signal';
      } else if (p.is_inside_geofence === true) {
        status = 'inside';
      } else {
        status = 'outside';
      }

      return {
        childId: p.child_id,
        fullName: p.full_name,
        grade: p.grade,
        lat: p.lat,
        lng: p.lng,
        accuracy: p.accuracy,
        batteryLevel: p.battery_level,
        createdAt: p.created_at,
        isInsideGeofence: hasSignal ? p.is_inside_geofence : null,
        hasSignal,
        status,
        minutesSinceUpdate: p.minutes_since_update ? Math.round(p.minutes_since_update) : null,
      };
    });
  }

  /**
   * Obtener las últimas posiciones de los hijos de un padre específico
   * Similar a getAllChildrenLastPositions pero filtrado por parentId
   */
  async getMyChildrenLastPositions(parentId: number, schoolId: number) {
    // Umbral para considerar "sin señal" (30 minutos sin actualizar)
    const STALE_THRESHOLD_MINUTES = 30;

    const positions = await this.prisma.$queryRaw<
      Array<{
        child_id: number;
        full_name: string;
        grade: string | null;
        lat: number | null;
        lng: number | null;
        accuracy: number | null;
        battery_level: number | null;
        created_at: Date | null;
        is_inside_geofence: boolean | null;
        minutes_since_update: number | null;
      }>
    >`
      SELECT DISTINCT ON (c.id)
        c.id as child_id,
        c.full_name,
        c.grade,
        cp.lat,
        cp.lng,
        cp.accuracy,
        cp.battery_level,
        cp.created_at,
        CASE 
          WHEN cp.geom IS NULL THEN NULL
          ELSE COALESCE(
            public.ST_Within(
              cp.geom,
              (SELECT geom FROM "sig"."schools" WHERE id = ${schoolId})
            ),
            false
          )
        END as is_inside_geofence,
        CASE 
          WHEN cp.created_at IS NULL THEN NULL
          ELSE EXTRACT(EPOCH FROM (NOW() - cp.created_at)) / 60
        END as minutes_since_update
      FROM "sig"."children" c
      LEFT JOIN "sig"."child_positions" cp ON cp.child_id = c.id
      WHERE c.school_id = ${schoolId}
        AND c.parent_id = ${parentId}
        AND c.status = 'ACTIVE'
      ORDER BY c.id, cp.created_at DESC
    `;

    // Transformar y agregar status
    return positions.map((p) => {
      const hasPosition = p.lat !== null && p.lng !== null;
      const isStale = p.minutes_since_update !== null && p.minutes_since_update > STALE_THRESHOLD_MINUTES;
      const hasSignal = hasPosition && !isStale;

      let status: 'inside' | 'outside' | 'no_signal';
      if (!hasSignal) {
        status = 'no_signal';
      } else if (p.is_inside_geofence === true) {
        status = 'inside';
      } else {
        status = 'outside';
      }

      return {
        childId: p.child_id,
        fullName: p.full_name,
        grade: p.grade,
        lat: p.lat,
        lng: p.lng,
        accuracy: p.accuracy,
        batteryLevel: p.battery_level,
        createdAt: p.created_at,
        isInsideGeofence: hasSignal ? p.is_inside_geofence : null,
        hasSignal,
        status,
        minutesSinceUpdate: p.minutes_since_update ? Math.round(p.minutes_since_update) : null,
      };
    });
  }

  /**
   * Obtener ruta del niño por rango de fechas
   * Incluye estadísticas calculadas
   * NOTA: from y to deben venir en UTC desde el frontend
   */
  async getChildRoute(
    childId: number,
    from?: Date,
    to?: Date,
  ) {
    let startDate: Date;
    let endDate: Date;

    if (from && to) {
      startDate = from;
      endDate = to;
    } else {
      // Por defecto, últimas 24 horas
      endDate = new Date();
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    }

    // Obtener info del niño
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!child) {
      throw new NotFoundException('Hijo no encontrado');
    }

    // Obtener posiciones en el rango de fechas
    const positions = await this.prisma.childPosition.findMany({
      where: {
        childId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        lat: true,
        lng: true,
        accuracy: true,
        speed: true,
        heading: true,
        altitude: true,
        batteryLevel: true,
        createdAt: true,
      },
    });

    // Calcular estadísticas
    const stats = await this.calculateRouteStats(childId, positions, child.schoolId);

    // Obtener eventos (alertas) del día
    const events = await this.prisma.alert.findMany({
      where: {
        childId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        type: true,
        message: true,
        createdAt: true,
      },
    });

    return {
      child: {
        id: child.id,
        fullName: child.fullName,
        grade: child.grade,
        school: child.school,
      },
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
      route: positions.map(p => ({
        lat: p.lat,
        lng: p.lng,
        accuracy: p.accuracy,
        speed: p.speed,
        heading: p.heading,
        altitude: p.altitude,
        batteryLevel: p.batteryLevel,
        time: p.createdAt,
      })),
      stats,
      events: events.map(e => ({
        id: e.id,
        type: e.type,
        message: e.message,
        time: e.createdAt,
      })),
    };
  }

  /**
   * Calcular estadísticas de la ruta
   */
  private async calculateRouteStats(
    childId: number,
    positions: Array<{
      lat: number;
      lng: number;
      speed: number | null;
      createdAt: Date;
    }>,
    schoolId: number,
  ) {
    if (positions.length === 0) {
      return {
        totalPoints: 0,
        totalDistanceKm: 0,
        avgSpeedMs: 0,
        maxSpeedMs: 0,
        timeInAreaMinutes: 0,
        timeOutAreaMinutes: 0,
        firstPosition: null,
        lastPosition: null,
        entryTime: null,
        exitTime: null,
      };
    }

    // Calcular distancia total usando fórmula de Haversine
    // Filtramos movimientos menores a 15 metros para ignorar ruido GPS
    const MIN_DISTANCE_METERS = 0.015; // 15 metros en km
    let totalDistance = 0;
    for (let i = 1; i < positions.length; i++) {
      const segmentDistance = this.haversineDistance(
        positions[i - 1].lat,
        positions[i - 1].lng,
        positions[i].lat,
        positions[i].lng,
      );
      // Solo sumar si el movimiento es mayor a 10 metros (filtrar ruido GPS)
      if (segmentDistance > MIN_DISTANCE_METERS) {
        totalDistance += segmentDistance;
      }
    }

    // Calcular velocidad promedio y máxima
    const speeds = positions
      .map(p => p.speed)
      .filter((s): s is number => s !== null && s > 0);
    
    const avgSpeed = speeds.length > 0 
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length 
      : 0;
    const maxSpeed = speeds.length > 0 
      ? Math.max(...speeds) 
      : 0;

    // Calcular tiempo dentro/fuera del área usando PostGIS
    const areaStats = await this.calculateTimeInArea(childId, positions, schoolId);

    return {
      totalPoints: positions.length,
      totalDistanceKm: Math.round(totalDistance * 100) / 100,
      avgSpeedMs: Math.round(avgSpeed * 100) / 100,
      maxSpeedMs: Math.round(maxSpeed * 100) / 100,
      timeInAreaMinutes: areaStats.timeInArea,
      timeOutAreaMinutes: areaStats.timeOutArea,
      firstPosition: positions[0]?.createdAt || null,
      lastPosition: positions[positions.length - 1]?.createdAt || null,
      entryTime: areaStats.entryTime,
      exitTime: areaStats.exitTime,
    };
  }

  /**
   * Fórmula de Haversine para calcular distancia entre dos puntos
   */
  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Calcular tiempo dentro y fuera del área del colegio
   * OPTIMIZADO: Una sola consulta SQL en lugar de N consultas
   */
  private async calculateTimeInArea(
    childId: number,
    positions: Array<{ lat: number; lng: number; createdAt: Date }>,
    schoolId: number,
  ): Promise<{
    timeInArea: number;
    timeOutArea: number;
    entryTime: string | null;
    exitTime: string | null;
  }> {
    if (positions.length < 2) {
      return {
        timeInArea: 0,
        timeOutArea: 0,
        entryTime: positions[0]?.createdAt?.toISOString().substring(11, 19) || null,
        exitTime: null,
      };
    }

    // Verificar si el colegio tiene geofence definido (sin seleccionar geometry directamente)
    const hasGeofence = await this.prisma.$queryRaw<Array<{ has_geom: boolean }>>`
      SELECT (geom IS NOT NULL) as has_geom FROM "sig"."schools" WHERE id = ${schoolId}
    `;

    if (!hasGeofence[0]?.has_geom) {
      // Si no hay geofence definido, asumir todo dentro del área
      const totalMinutes = (positions[positions.length - 1].createdAt.getTime() - positions[0].createdAt.getTime()) / 60000;
      return {
        timeInArea: Math.round(totalMinutes),
        timeOutArea: 0,
        entryTime: positions[0].createdAt.toISOString().substring(11, 19),
        exitTime: positions[positions.length - 1].createdAt.toISOString().substring(11, 19),
      };
    }

    // Verificar todas las posiciones con una sola consulta usando unnest
    // Limitamos a máximo 100 posiciones para evitar consultas muy grandes
    const samplePositions = positions.length > 100 
      ? positions.filter((_, i) => i % Math.ceil(positions.length / 100) === 0)
      : positions;

    const lats = samplePositions.map(p => p.lat);
    const lngs = samplePositions.map(p => p.lng);

    const withinResults = await this.prisma.$queryRaw<Array<{ idx: number; within: boolean }>>`
      WITH pos AS (
        SELECT 
          row_number() OVER () as idx,
          lat,
          lng
        FROM unnest(${lats}::double precision[], ${lngs}::double precision[]) AS t(lat, lng)
      )
      SELECT 
        pos.idx::int as idx,
        COALESCE(
          public.ST_Within(
            public.ST_SetSRID(public.ST_MakePoint(pos.lng, pos.lat), 4326),
            (SELECT geom FROM "sig"."schools" WHERE id = ${schoolId})
          ),
          false
        ) as within
      FROM pos
      ORDER BY pos.idx
    `;

    // Mapear resultados a las posiciones
    const positionChecks = samplePositions.map((p, i) => ({
      ...p,
      isInArea: withinResults[i]?.within || false,
    }));

    let timeInArea = 0;
    let timeOutArea = 0;
    let entryTime: string | null = null;
    let exitTime: string | null = null;

    for (let i = 1; i < positionChecks.length; i++) {
      const prev = positionChecks[i - 1];
      const curr = positionChecks[i];
      const timeDiffMinutes =
        (curr.createdAt.getTime() - prev.createdAt.getTime()) / 60000;

      if (prev.isInArea) {
        timeInArea += timeDiffMinutes;
      } else {
        timeOutArea += timeDiffMinutes;
      }

      // Detectar primera entrada y última salida
      if (!prev.isInArea && curr.isInArea && !entryTime) {
        entryTime = curr.createdAt.toISOString().substring(11, 19);
      }
      if (prev.isInArea && !curr.isInArea) {
        exitTime = curr.createdAt.toISOString().substring(11, 19);
      }
    }

    // Si la primera posición está en área y no detectamos entrada
    if (positionChecks[0]?.isInArea && !entryTime) {
      entryTime = positionChecks[0].createdAt.toISOString().substring(11, 19);
    }

    return {
      timeInArea: Math.round(timeInArea),
      timeOutArea: Math.round(timeOutArea),
      entryTime,
      exitTime,
    };
  }

  /**
   * Obtener estadísticas del niño por período
   */
  async getChildStats(
    childId: number,
    period: 'day' | 'week' | 'month' = 'day',
    date?: string,
  ) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      select: {
        id: true,
        fullName: true,
        grade: true,
        schoolId: true,
      },
    });

    if (!child) {
      throw new NotFoundException('Hijo no encontrado');
    }

    // Calcular fechas según período
    let startDate: Date;
    let endDate: Date;
    const baseDate = date ? new Date(date) : new Date();

    switch (period) {
      case 'week':
        startDate = new Date(baseDate);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(baseDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate = new Date(baseDate);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(baseDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default: // day
        startDate = new Date(baseDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(baseDate);
        endDate.setHours(23, 59, 59, 999);
    }

    // Contar posiciones
    const positionCount = await this.prisma.childPosition.count({
      where: {
        childId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Contar alertas por tipo
    const alertCounts = await this.prisma.alert.groupBy({
      by: ['type'],
      where: {
        childId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    // Última posición y batería
    const lastPosition = await this.prisma.childPosition.findFirst({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      select: {
        lat: true,
        lng: true,
        batteryLevel: true,
        createdAt: true,
      },
    });

    // Dispositivo asociado
    const device = await this.prisma.device.findFirst({
      where: { childId },
      select: {
        id: true,
        name: true,
        model: true,
        lastBatteryLevel: true,
        lastSeen: true,
        status: true,
      },
    });

    return {
      child: {
        id: child.id,
        fullName: child.fullName,
        grade: child.grade,
      },
      period: {
        type: period,
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
      stats: {
        totalPositions: positionCount,
        exitAlerts: alertCounts.find(a => a.type === 'EXIT_AREA')?._count || 0,
        entryAlerts: alertCounts.find(a => a.type === 'ENTER_AREA')?._count || 0,
      },
      lastKnown: lastPosition
        ? {
            lat: lastPosition.lat,
            lng: lastPosition.lng,
            batteryLevel: lastPosition.batteryLevel,
            time: lastPosition.createdAt,
          }
        : null,
      device: device || null,
    };
  }

  /**
   * Enviar notificación push al padre cuando hay alerta de geocerca
   */
  private async sendPushToParent(
    parentId: number,
    childName: string,
    alertType: 'EXIT_AREA' | 'ENTER_AREA',
    alertId: number,
    childId: number,
    schoolId: number,
    position: { lat: number; lng: number },
  ): Promise<void> {
    try {
      // Obtener dispositivos de tipo PARENT vinculados a este childId
      // Estos son los dispositivos del padre que quiere recibir notificaciones
      const parentDevices = await this.prisma.device.findMany({
        where: {
          childId: childId,
          ownerType: 'PARENT',
          status: 'ACTIVE',
          fcmToken: { not: null },
        },
        select: {
          fcmToken: true,
        },
      });

      const tokens = parentDevices
        .map((d) => d.fcmToken)
        .filter((t): t is string => t !== null);

      if (tokens.length === 0) {
        this.logger.warn(
          `No hay dispositivos del padre registrados para el niño ${childId} - no se envió push`,
        );
        return;
      }

      const result = await this.notificationsService.sendGeofenceAlert(
        tokens,
        childName,
        alertType,
        alertId,
        childId,
        schoolId,
        position,
      );

      this.logger.log(
        `📱 Push enviado para alerta ${alertType}: ${result.success} éxitos, ${result.failure} fallos`,
      );
    } catch (error) {
      this.logger.error(`Error enviando push al padre ${parentId}:`, error);
    }
  }
}
