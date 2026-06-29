@php use App\Support\Forum; @endphp
@extends('layouts.app')

@section('title', 'Perfil | Forum Hideout')

@section('content')
<div class="grid home-grid">
    <section class="panel panel-pad stack">
        <div class="search-form" style="align-items: center; margin: 0">
            @include('partials.avatar', ['user' => auth()->user(), 'class' => 'avatar-lg'])
            <div>
                <p class="section-kicker">Tu perfil</p>
                <h1 class="title">{!! Forum::userName(auth()->user()->name, auth()->user()->role) !!}</h1>
                <p class="muted">{{ auth()->user()->email }}</p>
            </div>
        </div>

        <form class="form-grid" method="POST" action="{{ route('profile.update') }}" enctype="multipart/form-data">
            @csrf
            <label>
                Nombre
                <input class="input" name="name" value="{{ old('name', auth()->user()->name) }}" required>
            </label>
            <label>
                Foto de perfil
                <input class="input" name="avatar" type="file" accept="image/*">
            </label>
            <button class="btn btn-primary" type="submit">Guardar perfil</button>
        </form>
    </section>

    <aside class="panel panel-pad stack">
        <h2>Roles visibles</h2>
        @foreach (Forum::ROLES as $role)
            <div class="activity-card">
                {!! Forum::userName(Forum::roleLabel($role), $role) !!}
            </div>
        @endforeach
    </aside>
</div>

<section class="panel panel-pad stack" style="margin-top: 28px">
    <h2>Cambiar contrasena</h2>
    <form class="form-grid" method="POST" action="{{ route('profile.password') }}">
        @csrf
        <input class="input" name="currentPassword" type="password" placeholder="Contrasena actual" required>
        <input class="input" name="newPassword" type="password" placeholder="Nueva contrasena" required>
        <input class="input" name="newPassword_confirmation" type="password" placeholder="Confirmar nueva contrasena" required>
        <button class="btn btn-primary" type="submit">Cambiar contrasena</button>
    </form>
</section>
@endsection
