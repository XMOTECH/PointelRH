<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateDepartmentRequest
 * Validation des données pour la mise à jour d'un département
 */
class UpdateDepartmentRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'manager_id' => 'nullable|uuid',
            'parent_id' => 'nullable|uuid',
            'location' => 'nullable|string|max:255',
        ];
    }
}
