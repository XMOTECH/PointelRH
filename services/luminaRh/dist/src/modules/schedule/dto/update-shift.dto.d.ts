import { CreateShiftDto } from './create-shift.dto';
declare const UpdateShiftDto_base: import("@nestjs/common").Type<Partial<CreateShiftDto>>;
export declare class UpdateShiftDto extends UpdateShiftDto_base {
    status?: string;
}
export declare class MoveShiftDto {
    employeeId?: string | null;
    date?: string;
    startTime?: string;
    endTime?: string;
}
export {};
