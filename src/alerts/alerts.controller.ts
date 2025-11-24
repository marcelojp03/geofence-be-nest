import {
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Query,
  UseGuards,
  ParseBoolPipe,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { AlertType } from '@prisma/client';

@Controller('alerts')
@UseGuards(AuthGuard('jwt'))
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('childId', ParseIntPipe) childId?: number,
    @Query('isRead', ParseBoolPipe) isRead?: boolean,
    @Query('type') type?: AlertType,
  ) {
    return this.alertsService.findAll(user.schoolId, childId, isRead, type);
  }

  @Get('my-alerts')
  findMyAlerts(
    @CurrentUser() user: CurrentUserData,
    @Query('isRead', ParseBoolPipe) isRead?: boolean,
  ) {
    return this.alertsService.findByParent(user.userId, user.schoolId, isRead);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: CurrentUserData) {
    return this.alertsService.getUnreadCount(user.schoolId, user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.alertsService.findOne(id, user.schoolId);
  }

  @Patch(':id/mark-read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.alertsService.markAsRead(id, user.schoolId);
  }

  @Patch('mark-all-read')
  markAllAsRead(@CurrentUser() user: CurrentUserData) {
    return this.alertsService.markAllAsRead(user.schoolId, user.userId);
  }
}
