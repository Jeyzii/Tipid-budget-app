<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'timezone' => $data['timezone'] ?? 'UTC',
            'currency_code' => strtoupper($data['currency_code'] ?? 'USD'),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['data' => $user], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->validated())) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        $request->session()->regenerate();

        return response()->json(['data' => $request->user()]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out.']);
    }
}
