<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ScopeByDepartment
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $userRole = $request->auth_role;
        $departmentId = $request->auth_department_id ?? $request->header('X-Department-ID');

        // Si c'est un manager, on force le filtrage par son département
        if ($userRole === 'manager' && $departmentId) {
            $request->merge([
                'filter_department_id' => $departmentId,
                'department_id' => $departmentId
            ]);
        }

        return $next($request);
    }
}
