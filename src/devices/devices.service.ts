import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PairDeviceDto } from './dto/pair-device.dto';
import { RegisterParentDeviceDto } from './dto/register-parent-device.dto';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto, schoolId: number) {
    if (createDeviceDto.schoolId !== schoolId) {
      throw new ForbiddenException('No puedes crear dispositivos en otro colegio');
    }

    // Verificar si ya existe un dispositivo con ese deviceUid
    const existing = await this.prisma.device.findUnique({
      where: { deviceUid: createDeviceDto.deviceUid },
    });

    if (existing) {
      throw new ConflictException('El dispositivo ya está registrado');
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

  async findAll(schoolId: number) {
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

  async findOne(id: number, schoolId: number) {
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
      throw new NotFoundException('Dispositivo no encontrado');
    }

    if (device.schoolId !== schoolId) {
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    return device;
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto, schoolId: number) {
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

  async remove(id: number, schoolId: number) {
    await this.findOne(id, schoolId);

    return this.prisma.device.delete({
      where: { id },
    });
  }

  async linkToChild(deviceUid: string, childId: number, schoolId: number) {
    const device = await this.prisma.device.findUnique({
      where: { deviceUid },
    });

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    if (device.schoolId !== schoolId) {
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    // Verificar que el niño exista y sea del mismo colegio
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child || child.schoolId !== schoolId) {
      throw new NotFoundException('Hijo no encontrado');
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

  /**
   * Pairing de dispositivo desde modo hijo (child mode)
   * Endpoint público - no requiere autenticación
   * Registra el dispositivo y lo vincula al niño en un solo paso
   * 
   * REGLA: Solo UN dispositivo tipo CHILD puede estar vinculado a cada niño
   */
  async pairDevice(pairDeviceDto: PairDeviceDto) {
    const { schoolId, childId, deviceUid, ...deviceInfo } = pairDeviceDto;

    // Verificar que el colegio exista
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new BadRequestException('Colegio no encontrado');
    }

    // Verificar que el niño exista y pertenezca al colegio
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      include: {
        parent: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!child) {
      throw new NotFoundException('Hijo no encontrado');
    }

    if (child.schoolId !== schoolId) {
      throw new ForbiddenException('El hijo no pertenece a este colegio');
    }

    // Verificar si ya hay un dispositivo CHILD vinculado a este niño
    const existingChildDevice = await this.prisma.device.findFirst({
      where: {
        childId,
        ownerType: 'CHILD',
        status: 'ACTIVE',
      },
    });

    // Buscar si este dispositivo físico ya existe
    const existingDevice = await this.prisma.device.findUnique({
      where: { deviceUid },
    });

    let device;
    let previousDeviceUnlinked = false;

    // Si hay un dispositivo diferente vinculado al niño, desvincularlo
    if (existingChildDevice && existingChildDevice.deviceUid !== deviceUid) {
      await this.prisma.device.update({
        where: { id: existingChildDevice.id },
        data: { childId: null },
      });
      previousDeviceUnlinked = true;
    }

    if (existingDevice) {
      // Si el dispositivo existe, actualizarlo y vincularlo al niño
      device = await this.prisma.device.update({
        where: { id: existingDevice.id },
        data: {
          ...deviceInfo,
          schoolId,
          childId,
          ownerType: 'CHILD', // Asegurar que sea tipo CHILD
          lastSeen: new Date(),
        },
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
    } else {
      // Si no existe, crear el dispositivo y vincularlo
      device = await this.prisma.device.create({
        data: {
          deviceUid,
          ...deviceInfo,
          schoolId,
          childId,
          ownerType: 'CHILD', // Tipo CHILD para dispositivo del niño
          lastSeen: new Date(),
        },
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

    return {
      success: true,
      message: existingDevice 
        ? 'Dispositivo actualizado y vinculado correctamente' 
        : 'Dispositivo registrado y vinculado correctamente',
      previousDeviceUnlinked, // Indica si se desvinculó un dispositivo anterior
      device,
      child: {
        id: child.id,
        fullName: child.fullName,
        grade: child.grade,
        parent: child.parent,
      },
    };
  }

  /**
   * Registrar dispositivo del padre para recibir notificaciones
   * El padre debe estar autenticado y ser padre del niño
   * 
   * IMPORTANTE:
   * - Un padre puede tener múltiples dispositivos físicos (3 celulares)
   * - Un padre puede tener múltiples hijos
   * - Cada dispositivo del padre se registra UNA VEZ por cada hijo
   * - deviceUid único se forma como: parent-{deviceUid}-child-{childId}
   */
  async registerParentDevice(
    dto: RegisterParentDeviceDto,
    userId: number,
    schoolId: number,
  ) {
    const { childId, deviceUid, fcmToken, ...deviceInfo } = dto;

    // Verificar que el niño exista y que el usuario sea su padre
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException('Hijo no encontrado');
    }

    if (child.parentId !== userId) {
      throw new ForbiddenException('No eres el padre de este niño');
    }

    if (child.schoolId !== schoolId) {
      throw new ForbiddenException('El hijo no pertenece a tu colegio');
    }

    // El deviceUid único incluye el childId para permitir que un dispositivo
    // del padre reciba notificaciones de múltiples hijos
    const parentDeviceUid = `parent-${deviceUid}-child-${childId}`;

    // Buscar si ya existe un dispositivo del padre con este deviceUid para este niño
    const existingDevice = await this.prisma.device.findUnique({
      where: { deviceUid: parentDeviceUid },
    });

    let device;

    if (existingDevice) {
      // Si existe, actualizar el fcmToken y otros datos
      device = await this.prisma.device.update({
        where: { id: existingDevice.id },
        data: {
          ...deviceInfo,
          fcmToken,
          lastSeen: new Date(),
        },
      });
    } else {
      // Crear nuevo registro de dispositivo del padre
      device = await this.prisma.device.create({
        data: {
          deviceUid: parentDeviceUid,
          ...deviceInfo,
          fcmToken,
          childId,
          schoolId,
          ownerType: 'PARENT',
          lastSeen: new Date(),
        },
      });
    }

    return {
      success: true,
      message: existingDevice
        ? 'Dispositivo del padre actualizado correctamente'
        : 'Dispositivo del padre registrado correctamente',
      device: {
        id: device.id,
        deviceUid: device.deviceUid,
        ownerType: device.ownerType,
        childId: device.childId,
      },
    };
  }

  /**
   * Registrar dispositivo del padre para TODOS sus hijos a la vez
   * Útil cuando el padre inicia sesión en la app móvil
   */
  async registerParentDeviceForAllChildren(
    deviceUid: string,
    fcmToken: string,
    deviceInfo: {
      name?: string;
      model?: string;
      manufacturer?: string;
      osVersion?: string;
      platform?: string;
    },
    userId: number,
    schoolId: number,
  ) {
    // Obtener todos los hijos del padre
    const children = await this.prisma.child.findMany({
      where: {
        parentId: userId,
        schoolId,
        status: 'ACTIVE',
      },
      select: { id: true, fullName: true },
    });

    if (children.length === 0) {
      throw new NotFoundException('No tienes hijos registrados');
    }

    const results: Array<{ childId: number; childName: string; success: boolean }> = [];

    // Registrar el dispositivo para cada hijo
    for (const child of children) {
      try {
        await this.registerParentDevice(
          {
            childId: child.id,
            deviceUid,
            fcmToken,
            ...deviceInfo,
          },
          userId,
          schoolId,
        );
        results.push({ childId: child.id, childName: child.fullName, success: true });
      } catch (error) {
        results.push({ childId: child.id, childName: child.fullName, success: false });
      }
    }

    return {
      success: true,
      message: `Dispositivo registrado para ${results.filter(r => r.success).length}/${children.length} hijos`,
      registrations: results,
    };
  }

  /**
   * Actualizar FCM token de un dispositivo existente
   */
  async updateFcmToken(deviceUid: string, fcmToken: string) {
    const device = await this.prisma.device.findUnique({
      where: { deviceUid },
    });

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    return this.prisma.device.update({
      where: { id: device.id },
      data: {
        fcmToken,
        lastSeen: new Date(),
      },
    });
  }

  /**
   * Actualizar FCM token para todos los registros del padre
   * Busca todos los dispositivos del padre por el prefijo del deviceUid
   */
  async updateParentFcmToken(deviceUid: string, fcmToken: string, userId: number) {
    // Buscar todos los dispositivos del padre que coincidan con el patrón
    const pattern = `parent-${deviceUid}-child-%`;
    
    const updated = await this.prisma.device.updateMany({
      where: {
        deviceUid: { startsWith: `parent-${deviceUid}-child-` },
        ownerType: 'PARENT',
      },
      data: {
        fcmToken,
        lastSeen: new Date(),
      },
    });

    return {
      success: true,
      message: `FCM token actualizado en ${updated.count} registros`,
      updatedCount: updated.count,
    };
  }
}
