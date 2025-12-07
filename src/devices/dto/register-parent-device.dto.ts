import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO para registrar el dispositivo del padre
 * Permite al padre recibir notificaciones de sus hijos
 */
export class RegisterParentDeviceDto {
  @IsInt()
  @IsNotEmpty()
  childId: number;

  @IsString()
  @IsNotEmpty()
  deviceUid: string;

  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  osVersion?: string;

  @IsString()
  @IsOptional()
  platform?: string;
}
