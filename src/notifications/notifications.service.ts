import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { getFirebaseApp } from '../firebase/firebase.config';

export interface PushNotificationData {
  childId?: string;
  alertId?: string;
  alertType?: string;
  schoolId?: string;
  lat?: string;
  lng?: string;
  [key: string]: string | undefined;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private messaging: admin.messaging.Messaging | null = null;

  constructor() {
    const app = getFirebaseApp();
    if (app) {
      this.messaging = app.messaging();
    }
  }

  /**
   * Verifica si FCM está disponible
   */
  isAvailable(): boolean {
    return this.messaging !== null;
  }

  /**
   * Enviar notificación push a un dispositivo específico
   */
  async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: PushNotificationData,
  ): Promise<boolean> {
    if (!this.messaging) {
      this.logger.warn('FCM no configurado - notificación no enviada');
      return false;
    }

    if (!token) {
      this.logger.warn('Token FCM vacío - notificación no enviada');
      return false;
    }

    try {
      // Limpiar data: eliminar valores undefined y convertir todo a string
      const cleanData: Record<string, string> = {};
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            cleanData[key] = String(value);
          }
        });
      }

      const message: admin.messaging.Message = {
        token,
        notification: {
          title,
          body,
        },
        data: cleanData,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.messaging.send(message);
      this.logger.log(`✅ Push enviado: ${response}`);
      return true;
    } catch (error: any) {
      // Si el token es inválido, lo logueamos diferente
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        this.logger.warn(`Token FCM inválido o expirado: ${token.substring(0, 20)}...`);
      } else {
        this.logger.error(`Error enviando push: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Enviar notificación push a múltiples dispositivos
   */
  async sendToMultipleDevices(
    tokens: string[],
    title: string,
    body: string,
    data?: PushNotificationData,
  ): Promise<{ success: number; failure: number }> {
    if (!this.messaging) {
      this.logger.warn('FCM no configurado - notificaciones no enviadas');
      return { success: 0, failure: tokens.length };
    }

    const validTokens = tokens.filter((t) => t && t.length > 0);
    if (validTokens.length === 0) {
      return { success: 0, failure: 0 };
    }

    let success = 0;
    let failure = 0;

    // Enviar en paralelo pero con límite
    const results = await Promise.allSettled(
      validTokens.map((token) => this.sendToDevice(token, title, body, data)),
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        success++;
      } else {
        failure++;
      }
    });

    this.logger.log(`📊 Push enviados: ${success} éxitos, ${failure} fallos`);
    return { success, failure };
  }

  /**
   * Enviar notificación de alerta de geocerca
   */
  async sendGeofenceAlert(
    tokens: string[],
    childName: string,
    alertType: 'EXIT_AREA' | 'ENTER_AREA',
    alertId: number,
    childId: number,
    schoolId: number,
    position?: { lat: number; lng: number },
  ): Promise<{ success: number; failure: number }> {
    const isExit = alertType === 'EXIT_AREA';

    const title = isExit ? '🚨 Alerta de Salida' : '✅ Notificación de Entrada';

    const body = isExit
      ? `${childName} ha salido del área segura del colegio`
      : `${childName} ha ingresado al área del colegio`;

    const data: PushNotificationData = {
      alertId: String(alertId),
      alertType,
      childId: String(childId),
      schoolId: String(schoolId),
      ...(position && {
        lat: String(position.lat),
        lng: String(position.lng),
      }),
    };

    return this.sendToMultipleDevices(tokens, title, body, data);
  }
}
