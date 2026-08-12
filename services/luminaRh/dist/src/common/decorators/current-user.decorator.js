"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = exports.CurrentUserDto = void 0;
const common_1 = require("@nestjs/common");
class CurrentUserDto {
    id;
    name;
    email;
    role;
    companyId;
    employeeId;
    departmentId;
}
exports.CurrentUserDto = CurrentUserDto;
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.dbUser;
    return data ? user?.[data] : user;
});
//# sourceMappingURL=current-user.decorator.js.map