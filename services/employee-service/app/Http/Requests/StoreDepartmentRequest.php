<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreDepartmentRequest
 * Validation des données pour la création d'un département
 */
class StoreDepartmentRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'manager_id' => 'nullable|uuid',
            'parent_id' => 'nullable|uuid',
            'location' => 'nullable|string|max:255',
        ];
    }
}
