<?php

namespace App\Http\Controllers\Api;

use App\Models\Incident;
use App\Models\Mission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IncidentController extends BaseApiController
{
    /**
     * List incidents for a mission or company.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Incident::with(['reporter', 'mission'])
            ->where('company_id', $request->auth_company_id);

        if ($request->has('mission_id')) {
            $query->where('mission_id', $request->mission_id);
        }

        $incidents = $query->latest()->paginate(20);

        return $this->respondSuccess($incidents);
    }

    /**
     * Store a new incident report.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mission_id' => 'nullable|uuid|exists:missions,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'severity' => 'required|in:low,medium,high,critical',
        ]);

        try {
            $incident = Incident::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'company_id' => $request->auth_company_id,
                'mission_id' => $validated['mission_id'] ?? null,
                'employee_id' => $request->auth_employee_id, // assuming manager or reporter
                'title' => $validated['title'],
                'description' => $validated['description'],
                'severity' => $validated['severity'],
                'status' => 'reported',
                'reported_at' => now(),
            ]);

            return $this->respondCreated($incident);
        } catch (\Exception $e) {
            return $this->respondServerError('Failed to report incident');
        }
    }

    /**
     * Update incident status.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:reported,investigating,resolved',
        ]);

        $incident = Incident::where('company_id', $request->auth_company_id)->findOrFail($id);
        $incident->update(['status' => $validated['status']]);

        return $this->respondSuccess($incident);
    }
}
