import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Public()
  @Post()
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolsService.create(createSchoolDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.schoolsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schoolsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ) {
    return this.schoolsService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schoolsService.remove(id);
  }

  /**
   * Obtener el geofence de un colegio en formato GeoJSON
   * GET /schools/:id/geofence
   */
  @Public()
  @Get(':id/geofence')
  getGeofence(@Param('id', ParseIntPipe) id: number) {
    return this.schoolsService.getGeofence(id);
  }

  /**
   * Obtener todos los colegios con sus geofences
   * GET /schools/geofences
   */
  @Public()
  @Get('with-geofences')
  findAllWithGeofence() {
    return this.schoolsService.findAllWithGeofence();
  }
}
