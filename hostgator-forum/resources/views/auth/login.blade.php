@extends('layouts.app')

@section('title', 'Entrar | Forum Hideout')

@section('content')
<section class="panel panel-pad stack" style="max-width: 460px; margin: 0 auto">
    <h1 class="title">Entrar</h1>
    <p class="muted">Accede para participar en la comunidad.</p>

    <form class="form-grid" method="POST" action="{{ route('login.store') }}">
        @csrf
        <label>
            Email
            <input class="input" name="email" type="email" value="{{ old('email') }}" required>
        </label>
        <label>
            Contrasena
            <input class="input" name="password" type="password" required>
        </label>
        <button class="btn btn-primary" type="submit">Entrar</button>
    </form>

    <p class="muted">No tienes cuenta? <a class="link-accent" href="{{ route('register') }}">Crear cuenta</a></p>
</section>
@endsection
