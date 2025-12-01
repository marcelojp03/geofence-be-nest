// src/common/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiResponse } from '../responses/api-response';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;

    const now = Date.now();

    // Log de la solicitud entrante
    this.logger.log(
      `📥 ${method} ${url} - IP: ${ip} - UA: ${userAgent.substring(0, 50)}`,
    );

    // Log del body si existe (excepto passwords)
    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = { ...body };
      if (sanitizedBody.password) sanitizedBody.password = '***';
      if (sanitizedBody.passwordHash) sanitizedBody.passwordHash = '***';
      this.logger.debug(`📦 Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const responseTime = Date.now() - now;

        // Log de la respuesta
        this.logger.log(
          `📤 ${method} ${url} - ${statusCode} - ${responseTime}ms`,
        );
      }),
      map((data) => {
        // Si ya viene con formato ApiResponse, retornarlo
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Transformar a formato estándar
        return {
          success: true,
          message: 'OK',
          data,
        };
      }),
    );
  }
}
