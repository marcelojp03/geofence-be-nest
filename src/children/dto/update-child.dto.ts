import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateChildDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsInt()
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
