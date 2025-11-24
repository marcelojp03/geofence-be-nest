import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateDeviceDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del colegio es requerido' })
  schoolId: number;

  @IsInt()
  @IsOptional()
  childId?: number;

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
