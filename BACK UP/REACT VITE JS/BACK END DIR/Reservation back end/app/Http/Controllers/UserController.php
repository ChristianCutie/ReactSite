<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{


    /**
     * POST /api/users
     * Create new user
     */
    public function registerUser(Request $request)
    {
        $validated = $request->validate([
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'middle_initial'  => 'nullable|string|max:5',
            'email'           => 'required|email|unique:users,email',
            'password'        => 'required|min:8',
            'phone'           => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'first_name'     => $validated['first_name'],
            'last_name'      => $validated['last_name'],
            'middle_initial' => $validated['middle_initial'] ?? null,
            'email'          => $validated['email'],
            'password'       => Hash::make($validated['password']),
            'phone'          => $validated['phone'] ?? null,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'data'    => $user->makeHidden(['password']),
        ], 201);
    }

    /**
     * GET /api/users
     * List users
     */
    public function getUser(Request $request)
    {
        $users = User::select(
            'id',
            'first_name',
            'last_name',
            'middle_initial',
            'email',
            'phone',
            'created_at'
        )
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($users, 200);
    }

    /**
     * GET /api/users/{id}
     * Get single user
     */
    public function getUserById($id)
    {
        $user = User::select(
            'id',
            'first_name',
            'last_name',
            'middle_initial',
            'email',
            'phone',
            'created_at'
        )->find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json($user, 200);
    }

    public function updateUser(Request $request, $id)
    {
        $validated = $request->validate([
            'first_name'     => 'required|string',
            'last_name'      => 'required|string',
            'middle_initial' => 'nullable|string',
            'email'          => 'required|email|unique:users,email,' . $id,
            'phone'          => 'nullable|string|unique:users,phone,' . $id,
        ]);


        $user = User::findOrFail($id);

        $user->update([
            'first_name'     => $validated['first_name'],
            'last_name'      => $validated['last_name'],
            'middle_initial' => $validated['middle_initial'] ?? null,
            'email'          => $validated['email'],
            'phone'          => $validated['phone'] ?? null,
        ]);

        return response()->json([
            'message' => 'User updated successfully',
            'data'    => $user->makeHidden(['password']),
        ], 200);
    }
}
