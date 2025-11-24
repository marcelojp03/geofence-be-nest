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

  @UseGuards(AuthGuard('jwt'))
  @Get('child/:childId/last')
  getLastPosition(@Param('childId', ParseIntPipe) childId: number) {
    return this.trackingService.getChildLastPosition(childId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('child/:childId/history')
  getPositionHistory(
    @Param('childId', ParseIntPipe) childId: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.trackingService.getChildPositionHistory(childId, limit || 50);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('school/all-positions')
  getAllChildrenPositions(@CurrentUser() user: CurrentUserData) {
    return this.trackingService.getAllChildrenLastPositions(user.schoolId);
  }
}
