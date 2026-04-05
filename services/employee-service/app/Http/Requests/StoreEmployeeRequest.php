<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;

class StoreEmployeeRequest extends FormRequest
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
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                \Illuminate\Validation\Rule::unique('employees', 'email')
                    ->where('company_id', $this->auth_company_id),
            ],
            'phone' => 'nullable|string|max:20',
            'department_id' => 'required|uuid|exists:departments,id',
            'schedule_id' => 'required|uuid|exists:schedules,id',
            'contract_type' => 'required|in:cdi,cdd,freelance,intern',
            'hire_date' => 'required|date',
            'status' => 'sometimes|in:active,inactive,suspended',
            'role' => 'required|in:manager,employee',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        Log::warning('Employee creation validation failed', [
            'errors' => $validator->errors()->toArray(),
            'input' => $this->except(['password']),
        ]);

        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation errors',
            'data' => $validator->errors(),
        ], 422));
    }
}
