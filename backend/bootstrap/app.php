<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        // API + SPA: no web route named "login"; default redirectGuestsTo(route('login')) causes 500 on auth failure.
        $middleware->redirectGuestsTo(fn () => null);
        $middleware->statefulApi();
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('recurring:generate')->dailyAt('00:10');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
