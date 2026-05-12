<?php

use App\Http\Controllers\Api\V1\Student\MajorController;
use Illuminate\Support\Facades\Route;

Route::prefix('majors')
    ->middleware('auth:sanctum')
    ->controller(MajorController::class)
    ->group(function (): void {
        Route::patch('/{major}/favorite', 'toggleFavorite')
            ->name('api.v1.majors.favorite');
        Route::get('/{major:slug}/show','show');
        Route::get('/', [MajorController::class, 'index'])
            ->name('api.v1.majors.index');
    });
