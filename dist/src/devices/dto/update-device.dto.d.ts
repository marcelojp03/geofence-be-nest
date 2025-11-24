import { Status } from '@prisma/client';
export declare class UpdateDeviceDto {
    deviceId?: string;
    fcmToken?: string;
    model?: string;
    osVersion?: string;
    status?: Status;
}
