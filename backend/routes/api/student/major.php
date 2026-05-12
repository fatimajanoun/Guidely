<?php

use App\Http\Controllers\Api\V1\Student\MajorController;
use Illuminate\Support\Facades\Route;

Route::prefix('majors')
    ->middleware(['auth:sanctum','role:student'])
    ->group(function (): void {
        Route::patch('/{major}/favorite', [MajorController::class, 'toggleFavorite'])
            ->name('api.v1.majors.favorite');
        Route::get('/', [MajorController::class, 'index'])
            ->name('api.v1.majors.index');
    });
