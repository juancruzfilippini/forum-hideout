<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Topic;
use App\Models\User;
use App\Support\Forum;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $staff = User::updateOrCreate(
            ['email' => 'staff@forum.local'],
            [
                'id' => User::where('email', 'staff@forum.local')->value('id') ?? Forum::id(),
                'name' => 'Equipo Hideout',
                'role' => 'STAFF',
                'active' => true,
                'passwordHash' => Hash::make('change-me-now'),
            ],
        );

        $categories = [
            ['slug' => 'anuncios', 'name' => 'Anuncios', 'description' => 'Noticias del servidor, eventos y cambios importantes.', 'sortOrder' => 10],
            ['slug' => 'general', 'name' => 'General', 'description' => 'Charla libre de la comunidad.', 'sortOrder' => 20],
            ['slug' => 'soporte', 'name' => 'Soporte', 'description' => 'Reportes, ayuda tecnica y problemas de acceso.', 'sortOrder' => 30],
            ['slug' => 'sugerencias', 'name' => 'Sugerencias', 'description' => 'Ideas para mejorar el servidor y el foro.', 'sortOrder' => 40],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                ['id' => Category::where('slug', $category['slug'])->value('id') ?? Forum::id()] + $category,
            );
        }

        $announcements = Category::where('slug', 'anuncios')->firstOrFail();

        Topic::updateOrCreate(
            ['slug' => 'bienvenidos-al-foro-hideout'],
            [
                'id' => Topic::where('slug', 'bienvenidos-al-foro-hideout')->value('id') ?? Forum::id(),
                'title' => 'Bienvenidos al Foro Hideout',
                'body' => 'Este espacio queda listo para organizar avisos, soporte, sugerencias y conversaciones de la comunidad.',
                'status' => 'OPEN',
                'pinned' => true,
                'views' => 0,
                'authorId' => $staff->id,
                'categoryId' => $announcements->id,
            ],
        );
    }
}
