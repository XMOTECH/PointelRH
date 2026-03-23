<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'contract_type' => $this->contract_type,
            'qr_token' => $this->qr_token,
            'hire_date' => $this->hire_date,
            'status' => $this->status,
            'company_id' => $this->company_id,
            'department_id' => $this->department_id,
            'schedule_id' => $this->schedule_id,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'schedule' => new ScheduleResource($this->whenLoaded('schedule')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
