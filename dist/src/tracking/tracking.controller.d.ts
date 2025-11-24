import { TrackingService } from './tracking.service';
import { CreatePositionDto } from './dto/create-position.dto';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class TrackingController {
    private readonly trackingService;
    constructor(trackingService: TrackingService);
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
    getLastPosition(childId: number): Promise<{
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
    getPositionHistory(childId: number, limit?: number): Promise<{
        createdAt: Date;
        id: number;
        lat: number;
        lng: number;
        accuracy: number | null;
        speed: number | null;
        heading: number | null;
        altitude: number | null;
    }[]>;
    getAllChildrenPositions(user: CurrentUserData): Promise<{
        child_id: number;
        full_name: string;
        grade: string;
        lat: number;
        lng: number;
        created_at: Date;
    }[]>;
}
