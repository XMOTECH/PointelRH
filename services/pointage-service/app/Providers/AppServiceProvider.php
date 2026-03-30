<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Repositories\AttendanceRepository::class, \App\Repositories\AttendanceRepository::class);
        $this->app->singleton(\App\Events\EventPublisher::class, \App\Events\EventPublisher::class);

        $this->app->singleton(\App\Services\Drivers\QrDriver::class, function ($app) {
            return new \App\Services\Drivers\QrDriver(config('services.employee.url'));
        });

        $this->app->singleton(\App\Services\Drivers\PinDriver::class, function ($app) {
            return new \App\Services\Drivers\PinDriver(config('services.employee.url'));
        });

        $this->app->singleton(\App\Services\Drivers\LocationQrDriver::class, function ($app) {
            return new \App\Services\Drivers\LocationQrDriver(config('services.employee.url'));
        });

        $this->app->singleton(\App\Services\Drivers\WebDriver::class, function ($app) {
            return new \App\Services\Drivers\WebDriver(config('services.employee.url'));
        });

        $this->app->singleton(\App\Services\DriverResolver::class, function ($app) {
            $resolver = new \App\Services\DriverResolver();
            $resolver->register('qr', $app->make(\App\Services\Drivers\QrDriver::class));
            $resolver->register('pin', $app->make(\App\Services\Drivers\PinDriver::class));
            $resolver->register('qr_location', $app->make(\App\Services\Drivers\LocationQrDriver::class));
            $resolver->register('web', $app->make(\App\Services\Drivers\WebDriver::class));
            return $resolver;
        });

        $this->app->singleton(\App\Services\ClockOutService::class, function ($app) {
            return new \App\Services\ClockOutService(
                $app->make(\App\Repositories\AttendanceRepository::class),
                $app->make(\App\Events\EventPublisher::class)
            );
        });

        $this->app->singleton(\App\Services\ClockInService::class, function ($app) {
            return new \App\Services\ClockInService(
                $app->make(\App\Services\DriverResolver::class),
                $app->make(\App\Repositories\AttendanceRepository::class),
                $app->make(\App\Events\EventPublisher::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
