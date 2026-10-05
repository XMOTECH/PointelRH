import { CreateMyTaskDto } from './create-my-task.dto';
declare const UpdateMyTaskDto_base: import("@nestjs/common").Type<Partial<CreateMyTaskDto>>;
export declare class UpdateMyTaskDto extends UpdateMyTaskDto_base {
    status?: string;
}
export {};
