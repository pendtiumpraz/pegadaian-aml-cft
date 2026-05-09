<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LoginController extends Controller
{
    /** Local login form */
    public function showLogin(Request $request)
    {
        return Inertia::render('Auth/Login', [
            'portal_sso_url' => route('auth.portal.redirect'),
            'app_name'       => config('app.name'),
        ]);
    }

    /** Local email/password login */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors([
            'email' => 'Email atau password salah.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }

    /** Kick off OAuth code flow with Portal */
    public function portalRedirect(Request $request)
    {
        $state = Str::random(40);
        $request->session()->put('portal_oauth_state', $state);

        $query = http_build_query([
            'client_id'     => config('services.portal.client_id'),
            'redirect_uri'  => config('services.portal.redirect_uri'),
            'response_type' => 'code',
            'scope'         => '',
            'state'         => $state,
        ]);

        return redirect(config('services.portal.url') . '/oauth/authorize?' . $query);
    }

    /** Receive auth code, exchange for token, fetch user, link/create local user, log in */
    public function portalCallback(Request $request)
    {
        $state = $request->session()->pull('portal_oauth_state');
        if (! $state || $state !== $request->input('state')) {
            return redirect()->route('login')->withErrors(['email' => 'State tidak valid (CSRF).']);
        }

        $tokenResponse = Http::asForm()->post(config('services.portal.url') . '/oauth/token', [
            'grant_type'    => 'authorization_code',
            'client_id'     => config('services.portal.client_id'),
            'client_secret' => config('services.portal.client_secret'),
            'redirect_uri'  => config('services.portal.redirect_uri'),
            'code'          => $request->input('code'),
        ]);

        if (! $tokenResponse->successful()) {
            return redirect()->route('login')->withErrors(['email' => 'Gagal tukar kode dengan Portal.']);
        }

        $accessToken = $tokenResponse->json('access_token');

        $userResponse = Http::withToken($accessToken)
            ->get(config('services.portal.url') . '/api/user');

        if (! $userResponse->successful()) {
            return redirect()->route('login')->withErrors(['email' => 'Gagal ambil data user dari Portal.']);
        }

        $portalUser = $userResponse->json();

        // Find local user by portal_user_id, then by email, then deny
        $localUser = User::where('portal_user_id', $portalUser['id'])->first()
                  ?? User::where('email', $portalUser['email'])->first();

        if (! $localUser) {
            return redirect()->route('login')->withErrors([
                'email' => 'User Portal "' . $portalUser['email'] . '" tidak terdaftar di aplikasi ini.',
            ]);
        }

        // Backfill portal_user_id if not set
        if (! $localUser->portal_user_id) {
            $localUser->portal_user_id = $portalUser['id'];
            $localUser->save();
        }

        Auth::login($localUser);
        $request->session()->regenerate();
        $request->session()->put('portal_token', $accessToken);

        return redirect()->intended(route('dashboard'));
    }
}
