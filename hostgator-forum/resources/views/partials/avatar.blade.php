<span class="avatar {{ $class ?? '' }}">
    @if (!empty($user->avatarUrl))
        <img src="{{ $user->avatarUrl }}" alt="Avatar de {{ $user->name }}">
    @else
        ♙
    @endif
</span>
