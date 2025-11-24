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

@Controller('devices')
@UseGuards(AuthGuard('jwt'))
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create(
    @Body() createDeviceDto: CreateDeviceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.create(createDeviceDto, user.schoolId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.devicesService.findAll(user.schoolId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.findOne(id, user.schoolId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.update(id, updateDeviceDto, user.schoolId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.devicesService.remove(id, user.schoolId);
  }

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
