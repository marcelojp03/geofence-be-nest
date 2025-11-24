import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateDeviceDto {
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

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  lastBatteryLevel?: number;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
