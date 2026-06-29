@extends('layouts.app')

@section('title', 'Crear cuenta | Forum Hideout')

@section('content')
<section class="panel panel-pad stack" style="max-width: 460px; margin: 0 auto">
    <h1 class="title">Crear cuenta</h1>

    <form class="form-grid" method="POST" action="{{ route('register.store') }}">
        @csrf
        <label>
            Nombre
            <input class="input" name="name" value="{{ old('name') }}" required>
        </label>
        <label>
            Email
            <input class="input" name="email" type="email" value="{{ old('email') }}" required>
        </label>
        <label>
            Contrasena
            <input class="input" name="password" type="password" required>
        </label>
        <button class="btn btn-primary" type="submit">Crear cuenta</button>
    </form>

    <p class="muted">Ya tienes cuenta? <a class="link-accent" href="{{ route('login') }}">Entrar</a></p>
</section>
@endsection
