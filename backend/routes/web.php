<?php

use Illuminate\Support\Facades\Route;

/*
| Same-domain production: build the SPA with `npm run build` in /frontend (outputs to public/app).
| Static files under public/app/assets are served directly; other /app/* paths get index.html.
*/
Route::get('/', function () {
    if (is_file(public_path('app/index.html'))) {
        return redirect('/app/');
    }

    return view('welcome');
});

Route::get('/app/{path?}', function (?string $path = null) {
    $index = public_path('app/index.html');

    if (! is_file($index)) {
        abort(503, 'Frontend is not built. Run `npm run build` in the frontend directory.');
    }

    return response()->file($index);
})->where('path', '.*');
