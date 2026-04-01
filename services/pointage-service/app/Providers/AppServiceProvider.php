<?php

namespace App\Providers;

use App\Events\EventPublisher;
use App\Repositories\AttendanceRepository;
use App\Services\ClockInService;
use App\Services\ClockOutService;
use App\Services\DriverResolver;
use App\Services\Drivers\LocationQrDriver;
use App\Services\Drivers\PinDriver;
use App\Services\Drivers\QrDriver;
use App\Services\Drivers\WebDriver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AttendanceRepository::class, AttendanceRepository::class);
        $this->app->singleton(EventPublisher::class, EventPublisher::class);

        $this->app->singleton(QrDriver::class, function ($app) {
            return new QrDriver(config('services.employee.url'));
        });

        $this->app->singleton(PinDriver::class, function ($app) {
            return new PinDriver(config('services.employee.url'));
        });

        $this->app->singleton(LocationQrDriver::class, function ($app) {
            return new LocationQrDriver(config('services.employee.url'));
        });

        $this->app->singleton(WebDriver::class, function ($app) {
            return new WebDriver(config('services.employee.url'));
        });

        $this->app->singleton(DriverResolver::class, function ($app) {
            $resolver = new DriverResolver;
            $resolver->register('qr', $app->make(QrDriver::class));
            $resolver->register('pin', $app->make(PinDriver::class));
            $resolver->register('qr_location', $app->make(LocationQrDriver::class));
            $resolver->register('web', $app->make(WebDriver::class));

            return $resolver;
        });

        $this->app->singleton(ClockOutService::class, function ($app) {
            return new ClockOutService(
                $app->make(AttendanceRepository::class),
                $app->make(EventPublisher::class)
            );
        });

        $this->app->singleton(ClockInService::class, function ($app) {
            return new ClockInService(
                $app->make(DriverResolver::class),
                $app->make(AttendanceRepository::class),
                $app->make(EventPublisher::class)
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
