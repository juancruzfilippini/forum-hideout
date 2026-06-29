<?php

namespace App\Http\Middleware;

use App\Support\Forum;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureForumAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! Forum::canAccessAdmin($user->role)) {
            return redirect()->route('home');
        }

        return $next($request);
    }
}
