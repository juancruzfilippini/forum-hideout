<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Post;
use App\Models\Topic;
use App\Support\Forum;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class ForumController extends Controller
{
    public function home(Request $request): View
    {
        $query = trim((string) $request->query('q', ''));

        $categories = Category::query()
            ->withCount(['topics' => fn ($q) => $q->visible()])
            ->with(['topics' => fn ($q) => $q->visible()->with('author')->orderByDesc('pinned')->orderByDesc('updatedAt')->limit(1)])
            ->orderBy('sortOrder')
            ->orderBy('name')
            ->get();

        $recentTopics = Topic::query()
            ->visible()
            ->with(['category', 'author'])
            ->withCount(['posts' => fn ($q) => $q->visible()])
            ->orderByDesc('pinned')
            ->orderByDesc('updatedAt')
            ->limit(8)
            ->get();

        $searchResults = collect();
        if ($query !== '') {
            $searchResults = Topic::query()
                ->visible()
                ->where(fn ($q) => $q->where('title', 'like', "%{$query}%")->orWhere('body', 'like', "%{$query}%"))
                ->with(['category', 'author'])
                ->withCount(['posts' => fn ($q) => $q->visible()])
                ->orderByDesc('pinned')
                ->orderByDesc('updatedAt')
                ->limit(20)
                ->get();
        }

        return view('forum.home', compact('categories', 'recentTopics', 'searchResults', 'query'));
    }

    public function category(Request $request, string $slug): View
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        $query = trim((string) $request->query('q', ''));

        $topics = Topic::query()
            ->visible()
            ->where('categoryId', $category->id)
            ->when($query !== '', fn ($q) => $q->where(fn ($sub) => $sub->where('title', 'like', "%{$query}%")->orWhere('body', 'like', "%{$query}%")))
            ->with('author')
            ->withCount(['posts' => fn ($q) => $q->visible()])
            ->orderByDesc('pinned')
            ->orderByDesc('updatedAt')
            ->paginate(10)
            ->withQueryString();

        return view('forum.category', compact('category', 'topics', 'query'));
    }

    public function topic(string $slug): View
    {
        $canSeeHidden = Forum::canAccessAdmin(Auth::user()?->role);

        $topic = Topic::query()
            ->where('slug', $slug)
            ->when(! $canSeeHidden, fn ($q) => $q->visible())
            ->with(['author', 'category', 'posts' => fn ($q) => $q->when(! $canSeeHidden, fn ($sub) => $sub->visible())->with('author')->orderBy('createdAt')])
            ->firstOrFail();

        $topic->increment('views');
        $categories = Category::orderBy('sortOrder')->orderBy('name')->get();

        return view('forum.topic', compact('topic', 'categories', 'canSeeHidden'));
    }

    public function newTopic(): View
    {
        $categories = Category::orderBy('sortOrder')->orderBy('name')->get();

        return view('forum.new-topic', compact('categories'));
    }

    public function storeTopic(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'categoryId' => ['required', 'exists:Category,id'],
            'title' => ['required', 'string', 'max:140'],
            'body' => ['required', 'string', 'max:8000'],
        ]);

        $topic = Topic::create([
            'id' => Forum::id(),
            'slug' => Forum::topicSlug($data['title']),
            'title' => $data['title'],
            'body' => $data['body'],
            'status' => 'OPEN',
            'pinned' => false,
            'views' => 0,
            'authorId' => Auth::id(),
            'categoryId' => $data['categoryId'],
        ]);

        return redirect()->route('topics.show', $topic->slug);
    }

    public function storeReply(Request $request, Topic $topic): RedirectResponse
    {
        abort_if($topic->status !== 'OPEN', 403);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:8000'],
        ]);

        Post::create([
            'id' => Forum::id(),
            'body' => $data['body'],
            'hidden' => false,
            'authorId' => Auth::id(),
            'topicId' => $topic->id,
        ]);

        $topic->touch();

        return redirect()->route('topics.show', $topic->slug);
    }
}
