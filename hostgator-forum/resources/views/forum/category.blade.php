@php use App\Support\Forum; @endphp
@extends('layouts.app')

@section('title', $category->name.' | Forum Hideout')

@section('content')
<section class="stack">
    <div>
        <a class="btn" href="{{ route('home') }}">← Volver</a>
        <p class="section-kicker" style="margin-top: 22px">Categoria</p>
        <h1 class="title">{{ $category->name }}</h1>
        <p class="muted">{{ $category->description }}</p>
    </div>

    <form class="search-form" method="GET" action="{{ route('categories.show', $category->slug) }}">
        <input class="input" name="q" type="search" value="{{ $query }}" placeholder="Buscar temas en {{ $category->name }}">
        <button class="btn" type="submit">Buscar</button>
    </form>

    <div class="panel topic-list">
        @forelse ($topics as $topic)
            <article class="topic-row">
                <a class="row-link" href="{{ route('topics.show', $topic->slug) }}" aria-label="Ingresar a {{ $topic->title }}"></a>
                <div class="row-content">
                    <h2 class="row-title">{{ $topic->pinned ? '📌 ' : '' }}{{ $topic->title }}</h2>
                    <p class="row-desc">{{ str($topic->body)->limit(150) }}</p>
                    <p class="meta">por {!! Forum::userName($topic->author->name, $topic->author->role) !!}</p>
                </div>
                <div class="row-content meta">{{ $topic->posts_count }} respuestas</div>
            </article>
        @empty
            <div class="panel-pad muted">No hay temas todavia.</div>
        @endforelse
    </div>

    <div class="pager">
        @if ($topics->previousPageUrl())
            <a class="btn" href="{{ $topics->previousPageUrl() }}">Anterior</a>
        @else
            <span></span>
        @endif
        @if ($topics->nextPageUrl())
            <a class="btn" href="{{ $topics->nextPageUrl() }}">Siguiente</a>
        @endif
    </div>
</section>
@endsection
