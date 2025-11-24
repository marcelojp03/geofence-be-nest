import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto, currentUserSchoolId?: number): Promise<{
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        id: number;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        schoolId: number;
    }>;
    findAll(schoolId?: number, role?: UserRole): Promise<{
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        id: number;
        school: {
            code: string;
            name: string;
            id: number;
        };
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        schoolId: number;
    }[]>;
    findOne(id: number, currentUserSchoolId?: number): Promise<{
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        children: {
            status: import("@prisma/client").$Enums.Status;
            id: number;
            fullName: string;
            grade: string | null;
        }[];
        id: number;
        school: {
            code: string;
            name: string;
            id: number;
        };
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        schoolId: number;
    }>;
    update(id: number, updateUserDto: UpdateUserDto, currentUserSchoolId?: number): Promise<{
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        updatedAt: Date;
        id: number;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        schoolId: number;
    }>;
    remove(id: number, currentUserSchoolId?: number): Promise<{
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        email: string;
        passwordHash: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        schoolId: number;
    }>;
}
