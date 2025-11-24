export interface CurrentUserData {
    userId: number;
    email: string;
    role: string;
    schoolId: number;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
