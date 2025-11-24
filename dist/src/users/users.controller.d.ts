import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        id: number;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        schoolId: number;
    }>;
    findAll(user: CurrentUserData, role?: UserRole): Promise<{
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
    findOne(id: number, user: CurrentUserData): Promise<{
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
    update(id: number, updateUserDto: UpdateUserDto, user: CurrentUserData): Promise<{
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        updatedAt: Date;
        id: number;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        schoolId: number;
    }>;
    remove(id: number, user: CurrentUserData): Promise<{
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
