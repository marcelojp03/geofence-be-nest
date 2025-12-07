import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Public()
  @Post('positions')
  savePosition(@Body() createPositionDto: CreatePositionDto) {
    return this.trackingService.savePosition(createPositionDto);
  }

  // Devuelve todas las posiciones actuales del colegio (para admin)
  @UseGuards(AuthGuard('jwt'))
  @Get('current')
  getCurrentPositions(@CurrentUser() user: CurrentUserData) {
    return this.trackingService.getAllChildrenLastPositions(user.schoolId);
  }

  // Devuelve las posiciones de los hijos del padre logueado
  @UseGuards(AuthGuard('jwt'))
  @Get('my-children')
  getMyChildrenPositions(@CurrentUser() user: CurrentUserData) {
    return this.trackingService.getMyChildrenLastPositions(user.userId, user.schoolId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('child/:childId/last')
  getLastPosition(@Param('childId', ParseIntPipe) childId: number) {
    return this.trackingService.getChildLastPosition(childId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('child/:childId/history')
  getPositionHistory(
    @Param('childId', ParseIntPipe) childId: number,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.trackingService.getChildPositionHistory(childId, parsedLimit);
  }

  /**
   * Obtener ruta del niño con filtros de fecha
   * GET /tracking/child/:childId/route?from=2025-12-06T04:00:00.000Z&to=2025-12-07T03:59:59.999Z
   * NOTA: from y to deben enviarse en UTC desde el frontend
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('child/:childId/route')
  getChildRoute(
    @Param('childId', ParseIntPipe) childId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.trackingService.getChildRoute(childId, fromDate, toDate);
  }

  /**
   * Obtener estadísticas del niño
   * GET /tracking/child/:childId/stats?period=day&date=2025-12-06
   * GET /tracking/child/:childId/stats?period=week
   * GET /tracking/child/:childId/stats?period=month
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('child/:childId/stats')
  getChildStats(
    @Param('childId', ParseIntPipe) childId: number,
    @Query('period') period?: string,
    @Query('date') date?: string,
  ) {
    const validPeriod = ['day', 'week', 'month'].includes(period || '')
      ? (period as 'day' | 'week' | 'month')
      : 'day';
    return this.trackingService.getChildStats(childId, validPeriod, date);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('school/all-positions')
  getAllChildrenPositions(@CurrentUser() user: CurrentUserData) {
    return this.trackingService.getAllChildrenLastPositions(user.schoolId);
  }
}
