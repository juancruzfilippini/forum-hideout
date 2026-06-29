<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('User')) {
            Schema::create('User', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('email')->unique();
                $table->string('name');
                $table->enum('role', ['MEMBER', 'VIP', 'VIP_PLUS', 'ADMIN', 'ADMIN_PLUS', 'STAFF'])->default('MEMBER');
                $table->string('avatarUrl')->nullable();
                $table->boolean('active')->default(true);
                $table->timestamp('deactivatedAt')->nullable();
                $table->string('deactivationReason')->nullable();
                $table->string('passwordHash');
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->index('createdAt');
                $table->index('active');
            });
        }

        if (! Schema::hasTable('Category')) {
            Schema::create('Category', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('slug')->unique();
                $table->string('name');
                $table->string('description');
                $table->integer('sortOrder')->default(0);
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->index('sortOrder');
            });
        }

        if (! Schema::hasTable('Topic')) {
            Schema::create('Topic', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('slug')->unique();
                $table->string('title');
                $table->text('body');
                $table->enum('status', ['OPEN', 'LOCKED', 'ARCHIVED'])->default('OPEN');
                $table->string('hiddenReason')->nullable();
                $table->boolean('pinned')->default(false);
                $table->integer('views')->default(0);
                $table->string('authorId');
                $table->string('categoryId');
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->index('authorId');
                $table->index('categoryId');
                $table->index(['pinned', 'updatedAt']);
                $table->index('createdAt');
                $table->foreign('authorId')->references('id')->on('User')->cascadeOnDelete();
                $table->foreign('categoryId')->references('id')->on('Category')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('Post')) {
            Schema::create('Post', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->text('body');
                $table->boolean('hidden')->default(false);
                $table->string('hiddenReason')->nullable();
                $table->string('authorId');
                $table->string('topicId');
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->index('authorId');
                $table->index('topicId');
                $table->index('createdAt');
                $table->foreign('authorId')->references('id')->on('User')->cascadeOnDelete();
                $table->foreign('topicId')->references('id')->on('Topic')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('Post');
        Schema::dropIfExists('Topic');
        Schema::dropIfExists('Category');
        Schema::dropIfExists('User');
    }
};
