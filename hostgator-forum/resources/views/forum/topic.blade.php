@php use App\Support\Forum; @endphp
@extends('layouts.app')

@section('title', $topic->title.' | Forum Hideout')

@section('content')
<article class="stack">
    <div class="pager">
        <div class="meta">
            <a class="link-accent" href="{{ route('home') }}">Foro</a> / 
            <a class="link-accent" href="{{ route('categories.show', $topic->category->slug) }}">{{ $topic->category->name }}</a>
        </div>
        <a class="btn" href="{{ route('categories.show', $topic->category->slug) }}">← Volver</a>
    </div>

    <section class="panel panel-pad topic-shell">
        @if ($canSeeHidden)
            <details class="topic-admin-menu">
                <summary class="btn">⚙ Config</summary>
                <div class="topic-admin-panel stack">
                    @if ($topic->status === 'ARCHIVED')
                        <form method="POST" action="{{ route('admin.topics.restore') }}">
                            @csrf
                            <input type="hidden" name="id" value="{{ $topic->id }}">
                            <button class="btn btn-primary" type="submit">Restaurar tema</button>
                        </form>
                    @else
                        <form class="form-grid" method="POST" action="{{ route('admin.topics.hide') }}">
                            @csrf
                            <input type="hidden" name="id" value="{{ $topic->id }}">
                            <textarea class="textarea" name="reason" placeholder="Motivo interno"></textarea>
                            <button class="btn btn-danger" type="submit">Ocultar tema</button>
                        </form>
                    @endif
                    <form class="form-grid" method="POST" action="{{ route('admin.topics.move') }}">
                        @csrf
                        <input type="hidden" name="id" value="{{ $topic->id }}">
                        <select class="select" name="categoryId">
                            @foreach ($categories as $category)
                                @if ($category->id !== $topic->categoryId)
                                    <option value="{{ $category->id }}">{{ $category->name }}</option>
                                @endif
                            @endforeach
                        </select>
                        <button class="btn" type="submit">Redirigir</button>
                    </form>
                </div>
            </details>
        @endif

        <div class="badge">{{ $topic->pinned ? 'Fijado' : $topic->category->name }}</div>
        @if ($topic->status === 'ARCHIVED')
            <p class="notice">Tema oculto para usuarios. {{ $topic->hiddenReason }}</p>
        @endif
        <h1 class="title" style="margin-top: 14px">{{ $topic->title }}</h1>
        <div class="search-form" style="align-items: center">
            @include('partials.avatar', ['user' => $topic->author])
            <div>
                <div class="meta">por {!! Forum::userName($topic->author->name, $topic->author->role) !!} - {{ $topic->views + 1 }} vistas</div>
                {!! Forum::roleBadge($topic->author->role) !!}
            </div>
        </div>
        <p class="topic-body">{{ $topic->body }}</p>
    </section>

    <section class="stack">
        <h2>Respuestas</h2>
        @forelse ($topic->posts as $post)
            <article class="panel panel-pad">
                <div class="pager">
                    <div class="search-form" style="align-items: center; margin: 0">
                        @include('partials.avatar', ['user' => $post->author])
                        <div>
                            {!! Forum::userName($post->author->name, $post->author->role) !!}
                            <div>{!! Forum::roleBadge($post->author->role) !!}</div>
                        </div>
                    </div>
                    <time class="meta">{{ $post->createdAt->format('d/m/Y') }}</time>
                </div>
                @if ($post->hidden)
                    <p class="notice">Respuesta oculta para usuarios. {{ $post->hiddenReason }}</p>
                @endif
                <p class="post-body">{{ $post->body }}</p>
                @if ($canSeeHidden)
                    @if ($post->hidden)
                        <form method="POST" action="{{ route('admin.posts.restore') }}">
                            @csrf
                            <input type="hidden" name="id" value="{{ $post->id }}">
                            <button class="btn btn-primary" type="submit">Restaurar respuesta</button>
                        </form>
                    @else
                        <form class="form-grid" method="POST" action="{{ route('admin.posts.hide') }}">
                            @csrf
                            <input type="hidden" name="id" value="{{ $post->id }}">
                            <input class="input" name="reason" placeholder="Motivo interno">
                            <button class="btn btn-danger" type="submit">Ocultar respuesta</button>
                        </form>
                    @endif
                @endif
            </article>
        @empty
            <p class="panel panel-pad muted">Aun no hay respuestas.</p>
        @endforelse
    </section>

    <section class="panel panel-pad">
        @auth
            @if ($topic->status === 'OPEN')
                <form class="form-grid" method="POST" action="{{ route('topics.reply', $topic) }}">
                    @csrf
                    <label>Responder como {!! Forum::userName(auth()->user()->name, auth()->user()->role) !!}</label>
                    <textarea class="textarea" name="body" required></textarea>
                    <button class="btn btn-primary" type="submit">Responder</button>
                </form>
            @else
                <p class="muted">Tema cerrado.</p>
            @endif
        @else
            <p class="muted">Inicia sesion para responder.</p>
            <a class="btn" href="{{ route('login') }}">Entrar</a>
        @endauth
    </section>
</article>
@endsection
