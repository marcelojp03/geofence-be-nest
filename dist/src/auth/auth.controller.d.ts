import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(user: CurrentUserData): Promise<{
        status: import("@prisma/client").$Enums.Status;
        id: number;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        schoolId: number;
    }>;
}
