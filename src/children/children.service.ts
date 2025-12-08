import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

  async create(createChildDto: CreateChildDto, currentUserSchoolId: number) {
    // Verificar multi-tenant
    if (createChildDto.schoolId !== currentUserSchoolId) {
      throw new ForbiddenException('No puedes crear hijos en otro colegio');
    }

    // Verificar que el padre exista y sea del mismo colegio
    const parent = await this.prisma.user.findUnique({
      where: { id: createChildDto.parentId },
    });

    if (!parent || parent.schoolId !== currentUserSchoolId) {
      throw new NotFoundException('Padre no encontrado');
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

  async findAll(schoolId: number, parentId?: number) {
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
          where: {
            ownerType: 'CHILD', // Solo dispositivos del hijo
          },
          select: {
            id: true,
            deviceUid: true,
            name: true,
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

  async findOne(id: number, schoolId: number) {
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
          },
        },
        devices: {
          where: {
            ownerType: 'CHILD', // Solo dispositivos del hijo
          },
        },
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
      throw new NotFoundException('Hijo no encontrado');
    }

    if (child.schoolId !== schoolId) {
      throw new ForbiddenException('No tienes acceso a este hijo');
    }

    return child;
  }

  async update(id: number, updateChildDto: UpdateChildDto, schoolId: number) {
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

  async remove(id: number, schoolId: number) {
    await this.findOne(id, schoolId);

    return this.prisma.child.delete({
      where: { id },
    });
  }

  async findByParent(parentId: number, schoolId: number) {
    const children = await this.prisma.child.findMany({
      where: {
        parentId,
        schoolId,
      },
      include: {
        devices: {
          where: {
            ownerType: 'CHILD', // Solo dispositivos del hijo, no del padre
            status: 'ACTIVE',
          },
          select: {
            id: true,
            deviceUid: true,
            name: true,
            status: true,
            lastSeen: true,
          },
          take: 1, // Solo el dispositivo activo
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

    // Calcular deviceStatus para cada hijo
    const ONLINE_THRESHOLD_MINUTES = 5;
    const RECENT_THRESHOLD_MINUTES = 30;

    return children.map((child) => {
      const device = child.devices[0]; // Dispositivo CHILD activo
      let deviceStatus: 'no_device' | 'online' | 'recent' | 'no_signal';
      let minutesSinceLastSeen: number | null = null;

      if (!device) {
        deviceStatus = 'no_device';
      } else if (!device.lastSeen) {
        deviceStatus = 'no_signal';
      } else {
        const now = new Date();
        minutesSinceLastSeen = Math.round(
          (now.getTime() - new Date(device.lastSeen).getTime()) / 60000,
        );

        if (minutesSinceLastSeen <= ONLINE_THRESHOLD_MINUTES) {
          deviceStatus = 'online';
        } else if (minutesSinceLastSeen <= RECENT_THRESHOLD_MINUTES) {
          deviceStatus = 'recent';
        } else {
          deviceStatus = 'no_signal';
        }
      }

      return {
        ...child,
        device: device || null,
        devices: undefined, // Remover el array, usar 'device' singular
        deviceStatus,
        minutesSinceLastSeen,
      };
    });
  }
}
