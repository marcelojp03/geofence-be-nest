import {
  IsNumber,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty({ message: 'El identificador del dispositivo es requerido' })
  deviceUid: string;

  @IsNumber()
  @IsNotEmpty({ message: 'La latitud es requerida' })
  @Min(-90, { message: 'Latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'Latitud debe estar entre -90 y 90' })
  lat: number;

  @IsNumber()
  @IsNotEmpty({ message: 'La longitud es requerida' })
  @Min(-180, { message: 'Longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'Longitud debe estar entre -180 y 180' })
  lng: number;

  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @IsNumber()
  @IsOptional()
  speed?: number;

  @IsNumber()
  @IsOptional()
  heading?: number;

  @IsNumber()
  @IsOptional()
  altitude?: number;

  @IsInt()
  @IsOptional()
  @Min(0, { message: 'El nivel de batería debe estar entre 0 y 100' })
  @Max(100, { message: 'El nivel de batería debe estar entre 0 y 100' })
  batteryLevel?: number;
}
