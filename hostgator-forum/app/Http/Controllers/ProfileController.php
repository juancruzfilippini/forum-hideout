<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class ProfileController extends Controller
{
    public function edit(): View
    {
        return view('profile.edit');
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        $user = $request->user();
        $user->name = $data['name'];

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatarUrl = Storage::url($path);
        }

        $user->save();

        return back()->with('profile', 'updated');
    }

    public function password(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'currentPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['currentPassword'], $user->passwordHash)) {
            return back()->withErrors(['currentPassword' => 'La contrasena actual no coincide.']);
        }

        $user->passwordHash = Hash::make($data['newPassword']);
        $user->save();

        return back()->with('password', 'changed');
    }
}
