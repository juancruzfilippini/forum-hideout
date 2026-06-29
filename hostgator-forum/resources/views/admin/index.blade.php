@php use App\Support\Forum; @endphp
@extends('layouts.app')

@section('title', 'Administracion | Forum Hideout')

@section('content')
<section class="panel panel-pad">
    <p class="section-kicker">Panel privado</p>
    <h1 class="title">Administracion</h1>
    <div style="margin-top: 10px">{!! Forum::roleBadge(auth()->user()->role) !!}</div>
</section>

<section class="panel panel-pad stack" style="margin-top: 28px">
    <h2>Usuarios</h2>
    <form class="search-form" method="GET" action="{{ route('admin.index') }}">
        <input class="input" name="userQ" value="{{ $userQ }}" placeholder="Buscar por nombre o mail">
        <select class="select" name="userRole">
            <option value="">Todos los rangos</option>
            @foreach (Forum::ROLES as $role)
                <option value="{{ $role }}" @selected($userRole === $role)>{{ Forum::roleLabel($role) }}</option>
            @endforeach
        </select>
        <button class="btn" type="submit">Filtrar</button>
    </form>

    <div class="panel">
        @foreach ($users as $account)
            <article class="admin-row">
                <div>
                    {!! Forum::userName($account->name, $account->role) !!}
                    <div class="meta">{{ $account->email }}</div>
                    @if (!$account->active)
                        <div class="error" style="margin-top: 8px">Usuario dado de baja. {{ $account->deactivationReason }}</div>
                    @endif
                </div>
                <form class="search-form" method="POST" action="{{ route('admin.users.role') }}" style="margin: 0">
                    @csrf
                    <input type="hidden" name="userId" value="{{ $account->id }}">
                    <select class="select" name="role" @disabled(!Forum::canAssignRole(auth()->user()->role, $account->role, $account->role))>
                        @foreach (Forum::ROLES as $role)
                            <option value="{{ $role }}" @selected($account->role === $role) @disabled(!Forum::canAssignRole(auth()->user()->role, $account->role, $role))>{{ Forum::roleLabel($role) }}</option>
                        @endforeach
                    </select>
                    <button class="btn" type="submit">Guardar</button>
                </form>
                <div>
                    @if ($account->active)
                        <form class="form-grid" method="POST" action="{{ route('admin.users.deactivate') }}">
                            @csrf
                            <input type="hidden" name="userId" value="{{ $account->id }}">
                            <input class="input" name="reason" placeholder="Motivo de baja">
                            <button class="btn btn-danger" @disabled($account->id === auth()->id() || !Forum::canManageUser(auth()->user()->role, $account->role))>Dar de baja</button>
                        </form>
                    @else
                        <form method="POST" action="{{ route('admin.users.reactivate') }}">
                            @csrf
                            <input type="hidden" name="userId" value="{{ $account->id }}">
                            <button class="btn btn-primary" @disabled(!Forum::canManageUser(auth()->user()->role, $account->role))>Dar de alta</button>
                        </form>
                    @endif
                </div>
                <p class="meta">{{ $account->topics_count }} temas<br>{{ $account->posts_count }} respuestas</p>
            </article>
        @endforeach
    </div>
    <div class="pager">
        @if ($users->previousPageUrl()) <a class="btn" href="{{ $users->previousPageUrl() }}">Anterior</a> @else <span></span> @endif
        @if ($users->nextPageUrl()) <a class="btn" href="{{ $users->nextPageUrl() }}">Siguiente</a> @endif
    </div>
</section>

<section class="panel panel-pad stack" style="margin-top: 28px">
    <h2>Temas y moderacion</h2>
    <form class="search-form" method="GET" action="{{ route('admin.index') }}">
        <input class="input" name="topicQ" value="{{ $topicQ }}" placeholder="Buscar tema por nombre">
        <button class="btn" type="submit">Buscar</button>
    </form>

    <div class="panel">
        @foreach ($topics as $topic)
            <article class="admin-row">
                <div>
                    <span class="section-kicker">{{ $topic->category->name }}</span>
                    <a class="row-title link-accent" href="{{ route('topics.show', $topic->slug) }}">{{ $topic->title }}</a>
                    <div class="meta">{{ $topic->posts_count }} respuestas - {!! Forum::userName($topic->author->name, $topic->author->role) !!}</div>
                    @if ($topic->status === 'ARCHIVED')
                        <div class="notice" style="margin-top: 8px">Oculto. {{ $topic->hiddenReason }}</div>
                    @endif
                </div>
                <form method="POST" action="{{ route('admin.topics.move') }}" class="search-form" style="margin: 0">
                    @csrf
                    <input type="hidden" name="id" value="{{ $topic->id }}">
                    <select class="select" name="categoryId">
                        @foreach ($categories as $category)
                            <option value="{{ $category->id }}" @selected($topic->categoryId === $category->id)>{{ $category->name }}</option>
                        @endforeach
                    </select>
                    <button class="btn">Mover</button>
                </form>
                @if ($topic->status === 'ARCHIVED')
                    <form method="POST" action="{{ route('admin.topics.restore') }}">
                        @csrf
                        <input type="hidden" name="id" value="{{ $topic->id }}">
                        <button class="btn btn-primary">Restaurar</button>
                    </form>
                @else
                    <form method="POST" action="{{ route('admin.topics.hide') }}" class="form-grid">
                        @csrf
                        <input type="hidden" name="id" value="{{ $topic->id }}">
                        <input class="input" name="reason" placeholder="Motivo interno">
                        <button class="btn btn-danger">Ocultar</button>
                    </form>
                @endif
                <span></span>
            </article>
        @endforeach
    </div>
    <div class="pager">
        @if ($topics->previousPageUrl()) <a class="btn" href="{{ $topics->previousPageUrl() }}">Anterior</a> @else <span></span> @endif
        @if ($topics->nextPageUrl()) <a class="btn" href="{{ $topics->nextPageUrl() }}">Siguiente</a> @endif
    </div>
</section>
@endsection
