import { PrismaService } from '../prisma/prisma.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
export declare class ChildrenService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createChildDto: CreateChildDto, currentUserSchoolId: number): Promise<{
        parent: {
            id: number;
            email: string;
            fullName: string;
        };
    } & {
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        fullName: string;
        schoolId: number;
        grade: string | null;
        parentId: number;
    }>;
    findAll(schoolId: number, parentId?: number): Promise<({
        devices: {
            status: import("@prisma/client").$Enums.Status;
            id: number;
            deviceName: string | null;
            platform: string | null;
            lastSeen: Date | null;
        }[];
        parent: {
            id: number;
            email: string;
            fullName: string;
        };
        _count: {
            alerts: number;
            positions: number;
        };
    } & {
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        fullName: string;
        schoolId: number;
        grade: string | null;
        parentId: number;
    })[]>;
    findOne(id: number, schoolId: number): Promise<{
        devices: {
            status: import("@prisma/client").$Enums.Status;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            schoolId: number;
            deviceId: string;
            deviceName: string | null;
            platform: string | null;
            fcmToken: string | null;
            lastSeen: Date | null;
            childId: number | null;
        }[];
        alerts: {
            createdAt: Date;
            id: number;
            schoolId: number;
            childId: number;
            message: string;
            isRead: boolean;
            positionId: number;
            type: import("@prisma/client").$Enums.AlertType;
            readAt: Date | null;
        }[];
        school: {
            code: string;
            name: string;
            id: number;
        };
        parent: {
            phone: string | null;
            id: number;
            email: string;
            fullName: string;
        };
        positions: {
            createdAt: Date;
            id: number;
            schoolId: number;
            childId: number;
            lat: number;
            lng: number;
            accuracy: number | null;
            speed: number | null;
            heading: number | null;
            altitude: number | null;
        }[];
    } & {
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        fullName: string;
        schoolId: number;
        grade: string | null;
        parentId: number;
    }>;
    update(id: number, updateChildDto: UpdateChildDto, schoolId: number): Promise<{
        parent: {
            id: number;
            email: string;
            fullName: string;
        };
    } & {
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        fullName: string;
        schoolId: number;
        grade: string | null;
        parentId: number;
    }>;
    remove(id: number, schoolId: number): Promise<{
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        fullName: string;
        schoolId: number;
        grade: string | null;
        parentId: number;
    }>;
    findByParent(parentId: number, schoolId: number): Promise<({
        devices: {
            status: import("@prisma/client").$Enums.Status;
            id: number;
            deviceName: string | null;
            lastSeen: Date | null;
        }[];
        _count: {
            alerts: number;
        };
    } & {
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        fullName: string;
        schoolId: number;
        grade: string | null;
        parentId: number;
    })[]>;
}
