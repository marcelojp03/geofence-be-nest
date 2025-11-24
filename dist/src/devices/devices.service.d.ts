import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
export declare class DevicesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDeviceDto: CreateDeviceDto, schoolId: number): Promise<{
        child: {
            id: number;
            fullName: string;
        } | null;
    } & {
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
    }>;
    findAll(schoolId: number): Promise<({
        child: {
            id: number;
            fullName: string;
            grade: string | null;
        } | null;
    } & {
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
    })[]>;
    findOne(id: number, schoolId: number): Promise<{
        child: ({
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
        }) | null;
    } & {
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
    }>;
    update(id: number, updateDeviceDto: UpdateDeviceDto, schoolId: number): Promise<{
        child: {
            id: number;
            fullName: string;
        } | null;
    } & {
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
    }>;
    remove(id: number, schoolId: number): Promise<{
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
    }>;
    linkToChild(deviceId: string, childId: number, schoolId: number): Promise<{
        child: {
            id: number;
            fullName: string;
            grade: string | null;
        } | null;
    } & {
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
    }>;
}
