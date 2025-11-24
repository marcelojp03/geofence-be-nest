import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    schoolId: number;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: UserRole;
}
