<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                \Illuminate\Validation\Rule::unique('employees', 'email')
                    ->where('company_id', $this->auth_company_id)
                    ->ignore($this->route('employee')),
            ],
            'phone' => 'nullable|string|max:20',
            'department_id' => 'sometimes|uuid|exists:departments,id',
            'schedule_id' => 'sometimes|uuid|exists:schedules,id',
            'contract_type' => 'sometimes|in:cdi,cdd,freelance,intern',
            'hire_date' => 'sometimes|date',
            'status' => 'sometimes|in:active,inactive,suspended',
            'role' => 'sometimes|in:admin,manager,employee',
        ];
    }
}
