import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async create(createSchoolDto: CreateSchoolDto) {
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

  async findOne(id: number) {
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
      throw new NotFoundException('Colegio no encontrado');
    }

    return school;
  }

  async update(id: number, updateSchoolDto: UpdateSchoolDto) {
    await this.findOne(id);

    return this.prisma.school.update({
      where: { id },
      data: updateSchoolDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.school.delete({
      where: { id },
    });
  }
}
