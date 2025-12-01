import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { NotificationsService } from './notifications/notifications.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'geofence-backend',
    };
  }

  @Public()
  @Post('test-push')
  async testPush(@Body() body: { fcmToken: string; title?: string; message?: string }) {
    const { fcmToken, title = '🔔 Prueba de Notificación', message = 'Esta es una notificación de prueba desde el backend' } = body;

    if (!fcmToken) {
      return { success: false, message: 'fcmToken es requerido' };
    }

    const result = await this.notificationsService.sendToDevice(
      fcmToken,
      title,
      message,
      { type: 'TEST', timestamp: new Date().toISOString() },
    );

    return {
      success: result,
      message: result ? 'Notificación enviada correctamente' : 'Error al enviar notificación',
    };
  }
}
