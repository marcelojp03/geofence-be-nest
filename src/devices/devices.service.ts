import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

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
}
