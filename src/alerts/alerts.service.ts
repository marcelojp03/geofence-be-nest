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
}
