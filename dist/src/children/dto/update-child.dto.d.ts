import { Status } from '@prisma/client';
export declare class UpdateChildDto {
    fullName?: string;
    age?: number;
    grade?: string;
    parentId?: number;
    status?: Status;
}
