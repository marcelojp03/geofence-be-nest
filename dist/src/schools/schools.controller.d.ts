import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
export declare class SchoolsController {
    private readonly schoolsService;
    constructor(schoolsService: SchoolsService);
    create(createSchoolDto: CreateSchoolDto): Promise<{
        code: string;
        name: string;
        address: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    findAll(): Promise<({
        _count: {
            users: number;
            children: number;
        };
    } & {
        code: string;
        name: string;
        address: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    })[]>;
    findOne(id: number): Promise<{
        users: {
            status: import("@prisma/client").$Enums.Status;
            id: number;
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
        _count: {
            children: number;
            devices: number;
        };
    } & {
        code: string;
        name: string;
        address: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    update(id: number, updateSchoolDto: UpdateSchoolDto): Promise<{
        code: string;
        name: string;
        address: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    remove(id: number): Promise<{
        code: string;
        name: string;
        address: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
}
