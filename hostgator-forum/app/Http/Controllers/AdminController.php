<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Post;
use App\Models\Topic;
use App\Models\User;
use App\Support\Forum;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class AdminController extends Controller
{
    public function index(Request $request): View
    {
        $userQ = trim((string) $request->query('userQ', ''));
        $userRole = (string) $request->query('userRole', '');
        $topicQ = trim((string) $request->query('topicQ', ''));

        $users = User::query()
            ->when($userQ !== '', fn ($q) => $q->where(fn ($sub) => $sub->where('name', 'like', "%{$userQ}%")->orWhere('email', 'like', "%{$userQ}%")))
            ->when(in_array($userRole, Forum::ROLES, true), fn ($q) => $q->where('role', $userRole))
            ->withCount(['topics', 'posts'])
            ->orderByDesc('active')
            ->orderByDesc('createdAt')
            ->paginate(5, ['*'], 'userPage')
            ->withQueryString();

        $topics = Topic::query()
            ->when($topicQ !== '', fn ($q) => $q->where('title', 'like', "%{$topicQ}%"))
            ->with(['category', 'author'])
            ->withCount('posts')
            ->orderBy('status')
            ->orderByDesc('updatedAt')
            ->paginate(10, ['*'], 'topicPage')
            ->withQueryString();

        $categories = Category::orderBy('sortOrder')->orderBy('name')->get();

        return view('admin.index', compact('users', 'topics', 'categories', 'userQ', 'userRole', 'topicQ'));
    }

    public function updateUserRole(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'userId' => ['required', 'exists:User,id'],
            'role' => ['required', Rule::in(Forum::ROLES)],
        ]);

        $target = User::findOrFail($data['userId']);
        abort_unless(Forum::canAssignRole(Auth::user()->role, $target->role, $data['role']), 403);

        if ($target->id === Auth::id() && ! Forum::canAccessAdmin($data['role'])) {
            return back()->withErrors(['role' => 'No puedes quitarte el acceso de administracion.']);
        }

        $target->role = $data['role'];
        $target->save();

        return back()->with('users', 'updated');
    }

    public function deactivateUser(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'userId' => ['required', 'exists:User,id'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $target = User::findOrFail($data['userId']);
        abort_if($target->id === Auth::id(), 403);
        abort_unless(Forum::canManageUser(Auth::user()->role, $target->role), 403);

        $target->active = false;
        $target->deactivatedAt = now();
        $target->deactivationReason = $data['reason'] ?: 'Baja logica desde administracion.';
        $target->save();

        return back()->with('users', 'updated');
    }

    public function reactivateUser(Request $request): RedirectResponse
    {
        $data = $request->validate(['userId' => ['required', 'exists:User,id']]);

        $target = User::findOrFail($data['userId']);
        abort_unless(Forum::canManageUser(Auth::user()->role, $target->role), 403);

        $target->active = true;
        $target->deactivatedAt = null;
        $target->deactivationReason = null;
        $target->save();

        return back()->with('users', 'updated');
    }

    public function hideTopic(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'id' => ['required', 'exists:Topic,id'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $topic = Topic::findOrFail($data['id']);
        $topic->status = 'ARCHIVED';
        $topic->hiddenReason = $data['reason'] ?: 'Oculto por administracion.';
        $topic->save();

        return back();
    }

    public function restoreTopic(Request $request): RedirectResponse
    {
        $topic = Topic::findOrFail($request->validate(['id' => ['required', 'exists:Topic,id']])['id']);
        $topic->status = 'OPEN';
        $topic->hiddenReason = null;
        $topic->save();

        return back();
    }

    public function moveTopic(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'id' => ['required', 'exists:Topic,id'],
            'categoryId' => ['required', 'exists:Category,id'],
        ]);

        Topic::whereKey($data['id'])->update(['categoryId' => $data['categoryId']]);

        return back();
    }

    public function hidePost(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'id' => ['required', 'exists:Post,id'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        Post::whereKey($data['id'])->update([
            'hidden' => true,
            'hiddenReason' => $data['reason'] ?: 'Respuesta oculta por administracion.',
        ]);

        return back();
    }

    public function restorePost(Request $request): RedirectResponse
    {
        Post::whereKey($request->validate(['id' => ['required', 'exists:Post,id']])['id'])->update([
            'hidden' => false,
            'hiddenReason' => null,
        ]);

        return back();
    }
}
