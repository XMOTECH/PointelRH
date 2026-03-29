<?php

namespace App\Providers;

use App\Models\Employee;
use App\Observers\EmployeeObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\RabbitMQService::class, function () {
            return new \App\Services\RabbitMQService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limiting pour les endpoints sensibles (PIN/QR resolution)
        // 5 tentatives par minute par IP pour éviter le brute force
        RateLimiter::for('resolve-employee', function ($request) {
            return Limit::perMinute(5)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Trop de tentatives. Veuillez réessayer dans une minute.',
                ], 429);
            });
        });
    }
}
