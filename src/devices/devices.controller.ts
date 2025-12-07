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
import { RegisterParentDeviceDto } from './dto/register-parent-device.dto';

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

  /**
   * Registrar dispositivo del padre para recibir notificaciones
   * POST /devices/register-parent
   * Requiere autenticación - el padre debe estar logueado
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('register-parent')
  registerParentDevice(
    @Body() dto: RegisterParentDeviceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.registerParentDevice(dto, user.userId, user.schoolId);
  }

  /**
   * Registrar dispositivo del padre para TODOS sus hijos a la vez
   * POST /devices/register-parent-all
   * Útil cuando el padre inicia sesión en la app móvil
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('register-parent-all')
  registerParentDeviceForAllChildren(
    @Body() body: {
      deviceUid: string;
      fcmToken: string;
      name?: string;
      model?: string;
      manufacturer?: string;
      osVersion?: string;
      platform?: string;
    },
    @CurrentUser() user: CurrentUserData,
  ) {
    const { deviceUid, fcmToken, ...deviceInfo } = body;
    return this.devicesService.registerParentDeviceForAllChildren(
      deviceUid,
      fcmToken,
      deviceInfo,
      user.userId,
      user.schoolId,
    );
  }

  /**
   * Actualizar FCM token de un dispositivo del hijo
   * PATCH /devices/fcm-token
   * Endpoint público para actualizar token cuando cambia
   */
  @Public()
  @Patch('fcm-token')
  updateFcmToken(@Body() body: { deviceUid: string; fcmToken: string }) {
    return this.devicesService.updateFcmToken(body.deviceUid, body.fcmToken);
  }

  /**
   * Actualizar FCM token para todos los registros del padre
   * PATCH /devices/parent-fcm-token
   * Requiere autenticación
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('parent-fcm-token')
  updateParentFcmToken(
    @Body() body: { deviceUid: string; fcmToken: string },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.updateParentFcmToken(
      body.deviceUid,
      body.fcmToken,
      user.userId,
    );
  }
}
