import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class CurrentUserDto {
  id!: string;
  name!: string;
  email!: string;
  role!: string;
  companyId!: string;
  employeeId!: string | null;
  departmentId!: string | null;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserDto | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.dbUser;
    
    return data ? user?.[data] : user;
  },
);
