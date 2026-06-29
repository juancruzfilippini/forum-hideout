<?php

namespace App\Support;

use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;

class Forum
{
    public const ROLES = ['MEMBER', 'VIP', 'VIP_PLUS', 'ADMIN', 'ADMIN_PLUS', 'STAFF'];

    private const ROLE_RANK = [
        'MEMBER' => 10,
        'VIP' => 20,
        'VIP_PLUS' => 30,
        'ADMIN' => 40,
        'ADMIN_PLUS' => 50,
        'STAFF' => 60,
    ];

    private const ROLE_LABELS = [
        'MEMBER' => 'Miembro',
        'VIP' => 'VIP',
        'VIP_PLUS' => 'VIP+',
        'ADMIN' => 'Admin',
        'ADMIN_PLUS' => 'Admin+',
        'STAFF' => 'Staff',
    ];

    private const ROLE_CLASSES = [
        'MEMBER' => 'role-member',
        'VIP' => 'role-vip',
        'VIP_PLUS' => 'role-vip-plus',
        'ADMIN' => 'role-admin',
        'ADMIN_PLUS' => 'role-admin-plus',
        'STAFF' => 'role-staff',
    ];

    public static function canAccessAdmin(?string $role): bool
    {
        return in_array($role, ['ADMIN_PLUS', 'STAFF'], true);
    }

    public static function canManageUser(string $actorRole, string $targetRole): bool
    {
        if ($actorRole === 'STAFF') {
            return true;
        }

        return $actorRole === 'ADMIN_PLUS' && self::rank($targetRole) < self::rank($actorRole);
    }

    public static function canAssignRole(string $actorRole, string $targetRole, string $nextRole): bool
    {
        if ($actorRole === 'STAFF') {
            return true;
        }

        return $actorRole === 'ADMIN_PLUS'
            && self::rank($targetRole) < self::rank($actorRole)
            && self::rank($nextRole) < self::rank($actorRole);
    }

    public static function roleLabel(string $role): string
    {
        return self::ROLE_LABELS[$role] ?? 'Miembro';
    }

    public static function userName(string $name, string $role, string $extraClass = ''): HtmlString
    {
        $safeName = e(self::decoratedName($name, $role));
        $class = trim('username '.(self::ROLE_CLASSES[$role] ?? self::ROLE_CLASSES['MEMBER']).' '.$extraClass);

        return new HtmlString("<span class=\"{$class}\">{$safeName}</span>");
    }

    public static function roleBadge(string $role): HtmlString
    {
        $label = e(self::roleLabel($role));
        $class = self::ROLE_CLASSES[$role] ?? self::ROLE_CLASSES['MEMBER'];

        return new HtmlString("<span class=\"role-badge {$class}\">{$label}</span>");
    }

    public static function id(): string
    {
        return strtolower((string) Str::ulid());
    }

    public static function topicSlug(string $title): string
    {
        return Str::slug($title).'-'.Str::lower(Str::random(6));
    }

    private static function decoratedName(string $name, string $role): string
    {
        if ($role === 'STAFF') {
            return "⚡{$name}⚡";
        }

        if (in_array($role, ['VIP_PLUS', 'ADMIN_PLUS'], true)) {
            return "{$name}+";
        }

        return $name;
    }

    private static function rank(string $role): int
    {
        return self::ROLE_RANK[$role] ?? 0;
    }
}
