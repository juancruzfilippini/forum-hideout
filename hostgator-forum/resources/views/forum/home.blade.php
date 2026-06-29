@php use App\Support\Forum; @endphp
@extends('layouts.app')

@section('title', 'Forum Hideout')

@section('content')
<div class="grid home-grid">
    <section>
        <p class="section-kicker">Foro</p>
        <h1 class="title">Categorias de la comunidad</h1>

        <form class="search-form" method="GET" action="{{ route('home') }}">
            <input class="input" name="q" type="search" value="{{ $query }}" placeholder="Buscar temas en todo el foro">
            <button class="btn" type="submit">Buscar</button>
        </form>

        @if ($query !== '')
            <section class="panel panel-pad stack">
                <h2>Resultados para “{{ $query }}”</h2>
                @forelse ($searchResults as $topic)
                    <a class="activity-card" href="{{ route('topics.show', $topic->slug) }}">
                        <span class="section-kicker">{{ $topic->category->name }}</span>
                        <strong>{{ $topic->title }}</strong>
                        <span class="meta">{{ $topic->posts_count }} respuestas - {!! Forum::userName($topic->author->name, $topic->author->role) !!}</span>
                    </a>
                @empty
                    <p class="muted">No encontramos temas con esa busqueda.</p>
                @endforelse
            </section>
        @endif

        <div class="panel category-list">
            @foreach ($categories as $category)
                @php $latest = $category->topics->first(); @endphp
                <article class="category-row">
                    <a class="row-link" href="{{ route('categories.show', $category->slug) }}" aria-label="Ingresar a {{ $category->name }}"></a>
                    <div class="row-content">
                        <h2 class="row-title">{{ $category->name }}</h2>
                        <p class="row-desc">{{ $category->description }}</p>
                    </div>
                    <div class="row-content meta">{{ $category->topics_count }} temas</div>
                    <div class="row-content meta">
                        @if ($latest)
                            <a class="link-accent" href="{{ route('topics.show', $latest->slug) }}">{{ $latest->pinned ? '📌 ' : '' }}{{ $latest->title }}</a>
                            <div>por {!! Forum::userName($latest->author->name, $latest->author->role) !!}</div>
                        @else
                            Sin temas todavia
                        @endif
                    </div>
                </article>
            @endforeach
        </div>
    </section>

    <aside>
        <div class="panel panel-pad stack">
            <h2>Actividad reciente</h2>
            @foreach ($recentTopics as $topic)
                <a class="activity-card" href="{{ route('topics.show', $topic->slug) }}">
                    <span class="section-kicker">{{ $topic->category->name }}</span>
                    <strong>{{ $topic->title }}</strong>
                    <span class="meta">{{ $topic->posts_count }} respuestas - {!! Forum::userName($topic->author->name, $topic->author->role) !!}</span>
                </a>
            @endforeach
        </div>
    </aside>
</div>
@endsection
