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

  /**
   * Obtener el geofence del colegio en formato GeoJSON
   * Útil para dibujar el polígono en el mapa del frontend
   */
  async getGeofence(id: number) {
    const result = await this.prisma.$queryRaw<
      Array<{ id: number; name: string; address: string | null; phone: string | null; status: string; geojson: string | null }>
    >`
      SELECT 
        id, 
        name,
        address,
        phone,
        status,
        public.ST_AsGeoJSON(geom) as geojson
      FROM "sig"."schools" 
      WHERE id = ${id}
    `;

    if (!result[0]) {
      throw new NotFoundException('Colegio no encontrado');
    }

    const school = result[0];

    return {
      id: school.id,
      name: school.name,
      address: school.address,
      phone: school.phone,
      status: school.status,
      geofence: school.geojson ? JSON.parse(school.geojson) : null,
      hasGeofence: school.geojson !== null,
    };
  }

  /**
   * Obtener todos los colegios con sus geofences
   */
  async findAllWithGeofence() {
    const result = await this.prisma.$queryRaw<
      Array<{ id: number; name: string; address: string | null; phone: string | null; status: string; geojson: string | null }>
    >`
      SELECT 
        id, 
        name,
        address,
        phone,
        status,
        public.ST_AsGeoJSON(geom) as geojson
      FROM "sig"."schools" 
      WHERE status = 'ACTIVE'
    `;

    return result.map((school) => ({
      id: school.id,
      name: school.name,
      address: school.address,
      phone: school.phone,
      status: school.status,
      geofence: school.geojson ? JSON.parse(school.geojson) : null,
      hasGeofence: school.geojson !== null,
    }));
  }
}
