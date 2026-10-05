export declare class CurrentUserDto {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    employeeId: string | null;
    departmentId: string | null;
}
export declare const CurrentUser: (...dataOrPipes: (keyof CurrentUserDto | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
