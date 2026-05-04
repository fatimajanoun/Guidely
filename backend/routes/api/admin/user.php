<?php

use App\Http\Controllers\Api\V1\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin/users')
        ->controller(UserController::class)
        ->middleware(['auth:sanctum', 'role:admin'])
        ->group(function (): void {
            Route::get('/','index');
            Route::patch('/{user}/toggleBlock','toggleBlock');
        });


