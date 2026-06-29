@extends('layouts.app')

@section('title', 'Nuevo tema | Forum Hideout')

@section('content')
<section class="panel panel-pad stack" style="max-width: 860px; margin: 0 auto">
    <h1 class="title">Nuevo tema</h1>
    <p class="muted">Elige una categoria clara y agrega suficiente contexto para que otros usuarios puedan responder.</p>

    <form class="form-grid" method="POST" action="{{ route('topics.store') }}">
        @csrf
        <fieldset class="category-picker">
            @foreach ($categories as $category)
                <label>
                    <input type="radio" name="categoryId" value="{{ $category->id }}" @checked($loop->first) required>
                    <span class="category-pill">{{ $category->name }}</span>
                </label>
            @endforeach
        </fieldset>
        <input class="input" name="title" maxlength="140" placeholder="Titulo" required>
        <textarea class="textarea" name="body" placeholder="Contenido" required></textarea>
        <button class="btn btn-primary" type="submit">Publicar</button>
    </form>
</section>
@endsection
