import { PrismaService } from '../prisma/prisma.service';
import { AlertType } from '@prisma/client';
export declare class AlertsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(schoolId: number, childId?: number, isRead?: boolean, type?: AlertType): Promise<({
        child: {
            id: number;
            fullName: string;
            grade: string | null;
        };
        position: {
            createdAt: Date;
            id: number;
            lat: number;
            lng: number;
        };
    } & {
        createdAt: Date;
        id: number;
        schoolId: number;
        childId: number;
        message: string;
        isRead: boolean;
        positionId: number;
        type: import("@prisma/client").$Enums.AlertType;
        readAt: Date | null;
    })[]>;
    findByParent(parentId: number, schoolId: number, isRead?: boolean): Promise<({
        child: {
            id: number;
            fullName: string;
            grade: string | null;
        };
        position: {
            createdAt: Date;
            id: number;
            lat: number;
            lng: number;
        };
    } & {
        createdAt: Date;
        id: number;
        schoolId: number;
        childId: number;
        message: string;
        isRead: boolean;
        positionId: number;
        type: import("@prisma/client").$Enums.AlertType;
        readAt: Date | null;
    })[]>;
    findOne(id: number, schoolId: number): Promise<{
        child: {
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
        };
        position: {
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
        };
    } & {
        createdAt: Date;
        id: number;
        schoolId: number;
        childId: number;
        message: string;
        isRead: boolean;
        positionId: number;
        type: import("@prisma/client").$Enums.AlertType;
        readAt: Date | null;
    }>;
    markAsRead(id: number, schoolId: number): Promise<{
        createdAt: Date;
        id: number;
        schoolId: number;
        childId: number;
        message: string;
        isRead: boolean;
        positionId: number;
        type: import("@prisma/client").$Enums.AlertType;
        readAt: Date | null;
    }>;
    markAllAsRead(schoolId: number, parentId?: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getUnreadCount(schoolId: number, parentId?: number): Promise<number>;
}
