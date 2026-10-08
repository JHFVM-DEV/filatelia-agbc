<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('http://localhost:3000');
});

/**
 * Puente de Autenticación Unificada (Single Sign-On para Filament)
 * Permite que un usuario autenticado desde la landing page ingrese directamente
 * al panel de Filament sin pasar por la pantalla de login.
 */
Route::get('/admin/auth-bridge', function (Request $request) {
    $token = $request->query('token');

    if (!$token) {
        return redirect('/admin/login');
    }

    $userId = Cache::pull('sso_token_' . $token);

    if (!$userId) {
        return redirect('/admin/login')->with('error', 'El token de acceso unificado ha expirado o es inválido.');
    }

    $user = User::find($userId);

    if (!$user || !$user->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'ALMACEN'])) {
        return redirect('/admin/login')->with('error', 'El usuario no cuenta con permisos administrativos.');
    }

    Auth::login($user, true);
    $request->session()->regenerate();

    return redirect('/admin');
})->name('admin.auth-bridge');

Route::get('/admin/sso-logout', function (Request $request) {
    if (Auth::check() && method_exists(Auth::user(), 'tokens')) {
        Auth::user()->tokens()->delete();
    }
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('http://localhost:3000/?sso_logout=1');
})->name('admin.sso-logout');
