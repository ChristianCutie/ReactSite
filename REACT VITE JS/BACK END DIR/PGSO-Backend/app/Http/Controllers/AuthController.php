<?php
 
namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
 
class AuthController extends Controller
{
       public function login(Request $request)
    {
 
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);
        // Attempt to authenticate the user
        $user = User::where('email', $credentials['email'])->first();
        if (!$user || $credentials['password'] !== $user->password) {
            // Authentication failed
 
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
 
        $token = $user->createToken('auth_token');
        DB::table('personal_access_tokens')->insert([
            'tokenable_type' => 'App\Models\User',
            'tokenable_id' => $user->id,
            'name' => 'auth_token',
            'token' => $token->plainTextToken,
            'abilities' => '["*"]',
            'last_used_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
 
        return response()->json(['message' => 'Login successful', 'user' => $user, 'token' => $token->plainTextToken], 200);
    }
 
 
    public function logout(Request $request)
    {
        auth()->user()->tokens()->delete();
        return response()->json(['message' => 'Logout successful'], 200);
    }
}