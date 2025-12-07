import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertType } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    schoolId: number,
    childId?: number,
    isRead?: boolean,
    type?: AlertType,
  ) {
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

  async findByParent(parentId: number, schoolId: number, isRead?: boolean) {
    // Obtener todos los hijos del padre
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

  async findOne(id: number, schoolId: number) {
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
      throw new NotFoundException('Alerta no encontrada');
    }

    if (alert.schoolId !== schoolId) {
      throw new NotFoundException('No tienes acceso a esta alerta');
    }

    return alert;
  }

  async markAsRead(id: number, schoolId: number) {
    await this.findOne(id, schoolId);

    return this.prisma.alert.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(schoolId: number, parentId?: number) {
    if (parentId) {
      // Marcar como leídas solo las alertas de los hijos del padre
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

    // Marcar todas las del colegio
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

  async getUnreadCount(schoolId: number, parentId?: number) {
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

  /**
   * Obtener resumen de alertas de un hijo por período
   */
  async getChildAlertsSummary(
    childId: number,
    schoolId: number,
    from?: Date,
    to?: Date,
  ) {
    // Verificar que el hijo existe y pertenece al colegio
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      select: {
        id: true,
        fullName: true,
        grade: true,
        schoolId: true,
      },
    });

    if (!child || child.schoolId !== schoolId) {
      throw new NotFoundException('Hijo no encontrado');
    }

    // Fechas por defecto: últimos 7 días
    const endDate = to || new Date();
    const startDate = from || new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

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

    // Obtener alertas detalladas
    const alerts = await this.prisma.alert.findMany({
      where: {
        childId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        message: true,
        isRead: true,
        createdAt: true,
        position: {
          select: {
            lat: true,
            lng: true,
          },
        },
      },
    });

    // Agrupar alertas por día
    const alertsByDay: Record<string, { date: string; exit: number; entry: number }> = {};
    alerts.forEach(alert => {
      const dateKey = alert.createdAt.toISOString().substring(0, 10);
      if (!alertsByDay[dateKey]) {
        alertsByDay[dateKey] = { date: dateKey, exit: 0, entry: 0 };
      }
      if (alert.type === 'EXIT_AREA') {
        alertsByDay[dateKey].exit++;
      } else {
        alertsByDay[dateKey].entry++;
      }
    });

    return {
      child: {
        id: child.id,
        fullName: child.fullName,
        grade: child.grade,
      },
      period: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
      summary: {
        total: alerts.length,
        exitAlerts: alertCounts.find(a => a.type === 'EXIT_AREA')?._count || 0,
        entryAlerts: alertCounts.find(a => a.type === 'ENTER_AREA')?._count || 0,
        unread: alerts.filter(a => !a.isRead).length,
      },
      byDay: Object.values(alertsByDay).sort((a, b) => b.date.localeCompare(a.date)),
      alerts,
    };
  }
}
