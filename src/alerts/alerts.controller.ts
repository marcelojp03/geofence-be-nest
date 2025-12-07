import {
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Query,
  UseGuards,
  ParseBoolPipe,
  Optional,
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
    @Query('childId') childId?: string,
    @Query('isRead') isRead?: string,
    @Query('type') type?: AlertType,
  ) {
    const parsedChildId = childId ? parseInt(childId, 10) : undefined;
    const parsedIsRead = isRead !== undefined ? isRead === 'true' : undefined;
    return this.alertsService.findAll(user.schoolId, parsedChildId, parsedIsRead, type);
  }

  @Get('my-alerts')
  findMyAlerts(
    @CurrentUser() user: CurrentUserData,
    @Query('isRead') isRead?: string,
  ) {
    const parsedIsRead = isRead !== undefined ? isRead === 'true' : undefined;
    return this.alertsService.findByParent(user.userId, user.schoolId, parsedIsRead);
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

  /**
   * Obtener resumen de alertas de un hijo por período
   * GET /alerts/child/:childId/summary?from=2025-12-01&to=2025-12-06
   */
  @Get('child/:childId/summary')
  getChildAlertsSummary(
    @Param('childId', ParseIntPipe) childId: number,
    @CurrentUser() user: CurrentUserData,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.alertsService.getChildAlertsSummary(
      childId,
      user.schoolId,
      fromDate,
      toDate,
    );
  }
}
