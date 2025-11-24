import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateChildDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del colegio es requerido' })
  schoolId: number;

  @IsInt()
  @IsNotEmpty({ message: 'El ID del padre es requerido' })
  parentId: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  fullName: string;

  @IsInt()
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  grade?: string;
}
