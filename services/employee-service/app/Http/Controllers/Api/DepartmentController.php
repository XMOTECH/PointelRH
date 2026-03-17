<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $departments = Department::where('company_id', $request->auth_company_id)->get();
        return response()->json($departments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'manager_id' => 'nullable|uuid',
            'parent_id' => 'nullable|uuid',
            'location' => 'nullable|string|max:255',
        ]);

        $data['company_id'] = $request->auth_company_id;
        $department = Department::create($data);

        return response()->json($department, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $department = Department::where('company_id', $request->auth_company_id)->findOrFail($id);
        return response()->json($department);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $department = Department::where('company_id', $request->auth_company_id)->findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'manager_id' => 'nullable|uuid',
            'parent_id' => 'nullable|uuid',
            'location' => 'nullable|string|max:255',
        ]);

        $department->update($data);
        return response()->json($department);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $department = Department::where('company_id', $request->auth_company_id)->findOrFail($id);
        $department->delete();
        return response()->json(null, 204);
    }
}
