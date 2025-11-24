import { Status, UserRole } from '@prisma/client';
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    role?: UserRole;
    status?: Status;
}
