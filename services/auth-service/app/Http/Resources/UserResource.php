<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'email'         => $this->email,
            'role'          => $this->role,
            'company_id'    => $this->company_id,
            'employee_id'   => $this->employee_id,
            'department_id' => $this->department_id,
            'is_active'     => $this->is_active,
            'permissions'   => $this->getAllPermissions()->pluck('name'),
        ];
    }
}
