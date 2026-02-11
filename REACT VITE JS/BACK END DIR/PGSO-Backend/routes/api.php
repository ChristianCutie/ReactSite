<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BaseController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/create-user', [UserController::class, 'createUser']);
Route::get('/get-users', [UserController::class, 'getUser']);
Route::put('/update-user/{id}', [UserController::class, 'updateUser']);
Route::delete('/archive-user/{id}', [UserController::class, 'archiveUser']);

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');



//example - having a middleware
// Route::controller(BaseController::class)->middleware(['auth:sanctum'])->group(function () {
//     Route::get('get', 'getAll')->middleware('teacher');
// });