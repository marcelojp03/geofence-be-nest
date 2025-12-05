import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
} from 'class-validator';

/**
 * DTO para el pairing de dispositivo desde modo hijo (child mode)
 * Este endpoint es público - no requiere autenticación
 * Los datos vienen del QR escaneado + info del dispositivo
 */
export class PairDeviceDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del colegio es requerido' })
  schoolId: number;

  @IsInt()
  @IsNotEmpty({ message: 'El ID del niño es requerido' })
  childId: number;

  @IsString()
  @IsNotEmpty({ message: 'El identificador único del dispositivo es requerido' })
  deviceUid: string;

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

  @IsString()
  @IsOptional()
  fcmToken?: string;
}
