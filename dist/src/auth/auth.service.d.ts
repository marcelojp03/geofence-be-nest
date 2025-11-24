import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
            schoolId: number;
            school: {
                id: number;
                code: string;
                name: string;
            };
        };
    }>;
    validateUser(userId: number): Promise<{
        status: import("@prisma/client").$Enums.Status;
        id: number;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        schoolId: number;
    }>;
}
