<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class PortalTokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken()
                 ?? $request->cookie('portal_token')
                 ?? session('portal_token');

        if (! $token) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('login');
        }

        // Cache the introspection result for 60s to avoid hammering Portal
        $cacheKey = 'portal_user_' . hash('sha256', $token);
        $userData = Cache::remember($cacheKey, 60, function () use ($token) {
            try {
                $response = Http::withToken($token)
                    ->timeout(5)
                    ->get(config('services.portal.url') . '/api/user');

                if ($response->successful()) {
                    return $response->json();
                }
                return null;
            } catch (\Exception $e) {
                return null;
            }
        });

        if (! $userData || ! ($userData['is_active'] ?? false)) {
            Cache::forget($cacheKey);
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('login');
        }

        // Bind the authenticated user data into the request
        $request->merge(['_portal_user' => $userData]);
        // Also auth the local user if exists
        $localUser = \App\Models\User::where('portal_user_id', $userData['id'])->first();
        if ($localUser) {
            auth()->setUser($localUser);
        }

        return $next($request);
    }
}
