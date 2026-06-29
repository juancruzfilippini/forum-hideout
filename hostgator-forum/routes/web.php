<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ForumController::class, 'home'])->name('home');
Route::get('/categories/{slug}', [ForumController::class, 'category'])->name('categories.show');
Route::get('/topics/{slug}', [ForumController::class, 'topic'])->name('topics.show');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.store');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.store');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/new-topic', [ForumController::class, 'newTopic'])->name('topics.create');
    Route::post('/new-topic', [ForumController::class, 'storeTopic'])->name('topics.store');
    Route::post('/topics/{topic}/reply', [ForumController::class, 'storeReply'])->name('topics.reply');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/password', [ProfileController::class, 'password'])->name('profile.password');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('index');
    Route::post('/users/role', [AdminController::class, 'updateUserRole'])->name('users.role');
    Route::post('/users/deactivate', [AdminController::class, 'deactivateUser'])->name('users.deactivate');
    Route::post('/users/reactivate', [AdminController::class, 'reactivateUser'])->name('users.reactivate');
    Route::post('/topics/hide', [AdminController::class, 'hideTopic'])->name('topics.hide');
    Route::post('/topics/restore', [AdminController::class, 'restoreTopic'])->name('topics.restore');
    Route::post('/topics/move', [AdminController::class, 'moveTopic'])->name('topics.move');
    Route::post('/posts/hide', [AdminController::class, 'hidePost'])->name('posts.hide');
    Route::post('/posts/restore', [AdminController::class, 'restorePost'])->name('posts.restore');
});
