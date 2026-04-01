<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCompanyActive
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        \Log::debug('CheckCompanyActive middleware started');
        $res = $next($request);
        \Log::debug('CheckCompanyActive middleware finished');

        return $res;
    }
}
