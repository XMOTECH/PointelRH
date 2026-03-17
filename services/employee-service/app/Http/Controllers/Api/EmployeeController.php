<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Http\Resources\EmployeeResource;
use App\Http\Resources\EmployeeCollection;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): EmployeeCollection
    {
        $employees = Employee::where('company_id', $request->auth_company_id)
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->contract_type, fn($q) => $q->where('contract_type', $request->contract_type))
            ->paginate();

        return new EmployeeCollection($employees);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmployeeRequest $request): EmployeeResource
    {
        $data = $request->validated();
        $data['company_id'] = $request->auth_company_id;

        $employee = Employee::create($data);

        return new EmployeeResource($employee);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id, Request $request): EmployeeResource
    {
        $employee = Employee::with(['schedule', 'department'])
            ->where('company_id', $request->auth_company_id)
            ->findOrFail($id);

        return new EmployeeResource($employee);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEmployeeRequest $request, string $id): EmployeeResource
    {
        $employee = Employee::where('company_id', $request->auth_company_id)
            ->findOrFail($id);

        $employee->update($request->validated());

        return new EmployeeResource($employee);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $employee = Employee::where('company_id', $request->auth_company_id)
            ->findOrFail($id);

        $employee->delete();

        return response()->json(null, 204);
    }

    /**
     * Resolve an employee from their QR token.
     * POST /api/employees/resolve-qr
     */
    public function resolveQr(Request $request): JsonResponse
    {
        $request->validate(['qr_token' => 'required|string']);
     
        $employee = Employee::with(['schedule', 'department'])
            ->where('qr_token', $request->qr_token)
            ->where('status', 'active')
            ->where('company_id', $request->auth_company_id)
            ->first();
     
        if (!$employee) {
            return response()->json(['error' => 'QR token invalide ou employé inactif'], 404);
        }
     
        return response()->json([
            'employee'   => new EmployeeResource($employee),
            'schedule'   => $employee->schedule,
            'department' => $employee->department,
        ]);
    }
     
    /**
     * Get the active schedule of an employee.
     * GET /api/employees/{id}/schedule
     */
    public function schedule(string $id): JsonResponse
    {
        $employee = Employee::with('schedule')->findOrFail($id);
     
        return response()->json([
            'schedule'     => $employee->schedule,
            'work_days'    => $employee->schedule->work_days,
            'start_time'   => $employee->schedule->start_time,
            'grace_minutes'=> $employee->schedule->grace_minutes,
            'timezone'     => $employee->schedule->timezone,
        ]);
    }

    /**
     * Update the status of an employee.
     * PATCH /api/employees/{id}/status
     */
    public function updateStatus(Request $request, string $id): EmployeeResource
    {
        $request->validate([
            'status' => 'required|in:active,inactive,suspended'
        ]);

        $employee = Employee::where('company_id', $request->auth_company_id)
            ->findOrFail($id);

        $employee->update(['status' => $request->status]);

        return new EmployeeResource($employee);
    }
}
