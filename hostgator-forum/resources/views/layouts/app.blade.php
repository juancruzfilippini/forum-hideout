@php use App\Support\Forum; @endphp
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Forum Hideout')</title>
    <link rel="stylesheet" href="{{ asset('css/forum.css') }}">
</head>
<body>
    <div class="site-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    <header class="site-header">
        <div class="container header-inner">
            <a class="brand" href="{{ route('home') }}">
                <span class="brand-mark">⌂</span>
                <span>
                    <span class="brand-title">Forum Hideout</span>
                    <span class="brand-subtitle">Comunidad del servidor</span>
                </span>
            </a>

            <nav class="nav" aria-label="Principal">
                @auth
                    <a class="btn" href="{{ route('topics.create') }}">Nuevo tema</a>
                    @if (Forum::canAccessAdmin(auth()->user()->role))
                        <a class="btn" href="{{ route('admin.index') }}">Administracion</a>
                    @endif
                    <a class="btn" href="{{ route('profile.edit') }}">Perfil</a>
                    <span class="muted">Hola, {!! Forum::userName(auth()->user()->name, auth()->user()->role) !!}</span>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button class="btn" type="submit">Salir</button>
                    </form>
                @else
                    <a class="btn" href="{{ route('login') }}">Entrar</a>
                    <a class="btn btn-primary" href="{{ route('register') }}">Crear cuenta</a>
                @endauth
            </nav>
        </div>
    </header>

    <main class="main">
        <div class="container">
            @if (session('profile') || session('password') || session('users'))
                <p class="notice">Cambios guardados correctamente.</p>
            @endif

            @if ($errors->any())
                <div class="error">
                    {{ $errors->first() }}
                </div>
            @endif

            @yield('content')
        </div>
    </main>
</body>
</html>
