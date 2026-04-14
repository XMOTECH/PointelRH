<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Pre-load tasks with relations in a single query
        $tasks = $this->tasks()->with(['comments.employee', 'assignee'])->get();

        $completedCount = $tasks->where('status', 'done')->count();
        $totalCount = $this->tasks_count ?? $tasks->count();

        // Build activity log from tasks + comments with full datetime for proper sorting
        $activityLog = $tasks->flatMap(function ($task) {
            $events = collect();

            if ($task->completed_at) {
                $events->push([
                    'time' => $task->completed_at->format('H:i'),
                    'datetime' => $task->completed_at->toIso8601String(),
                    'title' => 'Tache terminee',
                    'description' => $task->title . ' par ' . ($task->assignee?->first_name ?? 'N/A'),
                    'color' => 'emerald',
                ]);
            }

            return $events->concat($task->comments->map(fn ($c) => [
                'time' => $c->created_at->format('H:i'),
                'datetime' => $c->created_at->toIso8601String(),
                'title' => 'Nouveau commentaire',
                'description' => ($c->employee?->first_name ?? 'N/A') . ': ' . $c->content,
                'color' => 'blue',
            ]));
        })
            ->sortByDesc('datetime')
            ->values()
            ->take(10);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'status' => $this->status,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'department_id' => $this->department_id,
            'department' => $this->whenLoaded('department', function () {
                return [
                    'id' => $this->department->id,
                    'name' => $this->department->name,
                ];
            }),
            'employees' => EmployeeResource::collection($this->whenLoaded('employees')),
            'documents' => $this->whenLoaded('documents', function () {
                return $this->documents->map(fn ($d) => [
                    'id' => $d->id,
                    'file_name' => $d->file_name,
                    'file_type' => $d->file_type,
                    'file_size' => $d->file_size,
                    'url' => asset('storage/' . $d->file_path),
                    'uploaded_by_name' => $d->uploaded_by_name,
                    'created_at' => $d->created_at->toIso8601String(),
                ]);
            }),
            'stats' => [
                'total_tasks' => $totalCount,
                'completed_tasks' => $completedCount,
                'progression_percentage' => $totalCount > 0
                    ? round(($completedCount / $totalCount) * 100)
                    : 0,
            ],
            'activity_log' => $activityLog,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
