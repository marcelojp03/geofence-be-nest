import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, currentUserSchoolId?: number) {
    // Verificar que el email no exista
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar que el colegio exista
    const school = await this.prisma.school.findUnique({
      where: { id: createUserDto.schoolId },
    });

    if (!school) {
      throw new NotFoundException('Colegio no encontrado');
    }

    // Si hay un usuario actual, verificar que sea del mismo colegio
    if (
      currentUserSchoolId &&
      currentUserSchoolId !== createUserDto.schoolId
    ) {
      throw new ForbiddenException('No puedes crear usuarios de otro colegio');
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const { password, ...userData } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        schoolId: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findAll(schoolId?: number, role?: UserRole) {
    return this.prisma.user.findMany({
      where: {
        ...(schoolId && { schoolId }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        schoolId: true,
        phone: true,
        status: true,
        createdAt: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async findOne(id: number, currentUserSchoolId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        schoolId: true,
        phone: true,
        status: true,
        createdAt: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            fullName: true,
            grade: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar multi-tenant
    if (currentUserSchoolId && user.schoolId !== currentUserSchoolId) {
      throw new ForbiddenException('No tienes acceso a este usuario');
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUserSchoolId?: number,
  ) {
    const user = await this.findOne(id, currentUserSchoolId);

    // Si se actualiza email, verificar que no exista
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existing) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const { password, ...updateData } = updateUserDto;

    // Si se actualiza contraseña, hashearla
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        ...(passwordHash && { passwordHash }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        schoolId: true,
        phone: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number, currentUserSchoolId?: number) {
    await this.findOne(id, currentUserSchoolId);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
