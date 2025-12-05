import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PairDeviceDto } from './dto/pair-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  /**
   * ENDPOINT PÚBLICO para el modo hijo (child mode)
   * Registra el dispositivo y lo vincula al niño en un solo paso
   * No requiere autenticación - usado después de escanear QR
   */
  @Public()
  @Post('pair')
  pairDevice(@Body() pairDeviceDto: PairDeviceDto) {
    return this.devicesService.pairDevice(pairDeviceDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createDeviceDto: CreateDeviceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.create(createDeviceDto, user.schoolId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.devicesService.findAll(user.schoolId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.findOne(id, user.schoolId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.update(id, updateDeviceDto, user.schoolId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.remove(id, user.schoolId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('link')
  linkToChild(
    @Body() body: { deviceUid: string; childId: number },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.linkToChild(
      body.deviceUid,
      body.childId,
      user.schoolId,
    );
  }
}
