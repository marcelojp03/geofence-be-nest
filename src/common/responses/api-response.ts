// src/common/responses/api-response.ts
// Formato de respuesta estandarizado similar a Flask

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: PaginationMeta;
  code?: string;
  details?: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export class Responses {
  /**
   * Respuesta exitosa
   */
  static success<T>(data: T, message = 'OK', meta?: PaginationMeta): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    if (meta) {
      response.meta = meta;
    }
    return response;
  }

  /**
   * Respuesta paginada
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    message = 'OK',
  ): ApiResponse<T[]> {
    const meta: PaginationMeta = {
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    };
    return this.success(items, message, meta);
  }

  /**
   * Respuesta de error
   */
  static error(
    message = 'Error',
    code?: string,
    details?: any,
  ): ApiResponse<null> {
    const response: ApiResponse<null> = {
      success: false,
      message,
      data: null,
    };
    if (code) {
      response.code = code;
    }
    if (details) {
      response.details = details;
    }
    return response;
  }

  /**
   * Respuesta de creación exitosa
   */
  static created<T>(data: T, message = 'Creado exitosamente'): ApiResponse<T> {
    return this.success(data, message);
  }

  /**
   * Respuesta de actualización exitosa
   */
  static updated<T>(data: T, message = 'Actualizado exitosamente'): ApiResponse<T> {
    return this.success(data, message);
  }

  /**
   * Respuesta de eliminación exitosa
   */
  static deleted(message = 'Eliminado exitosamente'): ApiResponse<null> {
    return {
      success: true,
      message,
      data: null,
    };
  }
}
