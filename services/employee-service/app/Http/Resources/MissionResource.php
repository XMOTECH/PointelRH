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
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'status' => $this->status,
            'start_date' => $this->start_date ? $this->start_date->toDateString() : null,
            'end_date' => $this->end_date ? $this->end_date->toDateString() : null,
            'department_id' => $this->department_id,
            'department' => $this->whenLoaded('department', function () {
                return [
                    'id' => $this->department->id,
                    'name' => $this->department->name,
                ];
            }),
            'employees' => EmployeeResource::collection($this->whenLoaded('employees')),
            'stats' => [
                'total_tasks' => $this->tasks_count ?? 0,
                'completed_tasks' => $this->completed_tasks_count ?? $this->tasks()->where('status', 'done')->count(),
                'progression_percentage' => $this->tasks_count > 0 
                    ? round(($this->tasks()->where('status', 'done')->count() / $this->tasks_count) * 100) 
                    : 0,
            ],
            'activity_log' => $this->tasks()->with(['comments.employee', 'assignee'])
                ->get()
                ->flatMap(function($task) {
                    $events = collect();
                    
                    if ($task->completed_at) {
                        $events->push([
                            'time' => $task->completed_at->format('H:i'),
                            'title' => 'Tâche terminée',
                            'description' => $task->title . ' par ' . $task->assignee?->first_name,
                            'color' => 'emerald'
                        ]);
                    }

                    return $events->concat($task->comments->map(fn($c) => [
                        'time' => $c->created_at->format('H:i'),
                        'title' => 'Nouveau commentaire',
                        'description' => $c->employee?->first_name . ': ' . $c->content,
                        'color' => 'blue'
                    ]));
                })
                ->sortByDesc('time')
                ->values()
                ->take(10),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
