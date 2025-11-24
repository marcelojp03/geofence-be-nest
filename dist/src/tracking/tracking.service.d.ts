import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
export declare class TrackingService {
    private prisma;
    constructor(prisma: PrismaService);
    savePosition(createPositionDto: CreatePositionDto): Promise<{
        position: {
            createdAt: any;
            accuracy?: number;
            speed?: number;
            heading?: number;
            altitude?: number;
            id: any;
            childId: any;
            lat: number;
            lng: number;
        };
        isWithinArea: boolean;
        alertCreated: boolean;
        alert: any;
    }>;
    getChildLastPosition(childId: number): Promise<{
        child: {
            id: number;
            fullName: string;
            grade: string | null;
        };
    } & {
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
    }>;
    getChildPositionHistory(childId: number, limit?: number): Promise<{
        createdAt: Date;
        id: number;
        lat: number;
        lng: number;
        accuracy: number | null;
        speed: number | null;
        heading: number | null;
        altitude: number | null;
    }[]>;
    getAllChildrenLastPositions(schoolId: number): Promise<{
        child_id: number;
        full_name: string;
        grade: string;
        lat: number;
        lng: number;
        created_at: Date;
    }[]>;
}
