<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'employee_name' => $this->employee_name,
            'company_id' => $this->company_id,
            'department_id' => $this->department_id,
            'channel' => $this->channel,
            'checked_in_at' => $this->checked_in_at?->toIso8601String(),
            'checked_out_at' => $this->checked_out_at?->toIso8601String(),
            'work_date' => $this->work_date->format('Y-m-d'),
            'late_minutes' => $this->late_minutes,
            'work_minutes' => $this->work_minutes,
            'overtime_minutes' => $this->overtime_minutes,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'metadata' => $this->metadata,
        ];
    }
}
