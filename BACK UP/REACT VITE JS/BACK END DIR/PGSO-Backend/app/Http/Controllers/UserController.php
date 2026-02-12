<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function createUser(Request $request)
    {

        $user = new User();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->password = $request->password;
        $user->phone = $request->phone;
        $user->role = $request->role;
        $user->status = $request->status;
        $user->joindate = $request->joindate;
        $user->avatar = $request->avatar;
        $user->save();

        return response()->json($user);
    }

    public function getUser()
    {
        $user = User::where('is_archived', 1)->get();
        return response()->json($user);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);
        $user->name = $request->name;
        $user->email = $request->email;
        $user->password = $request->password;
        $user->phone = $request->phone;
        $user->role = $request->role;
        $user->status = $request->status;
        $user->joindate = $request->joindate;
        $user->avatar = $request->avatar;
        return response()->json($user);
    }

    public function archiveUser($id)
    {
        $user = User::find($id);
        $user->is_archived = 0;
        $user->save();
        return response()->json(['message' => 'User archived successfully']);
    }
}
