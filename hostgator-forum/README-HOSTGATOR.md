# Forum Hideout Laravel para HostGator

Esta es la version PHP/Laravel del foro. No necesita Node ni Next.js en produccion.

## Requisitos

- PHP 8.1 o superior.
- MySQL/MariaDB.
- Composer disponible localmente para preparar el proyecto.

## Variables `.env`

Copiar `.env.example` a `.env` y completar:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com
APP_KEY=base64:...

DB_HOST=162.241.61.103
DB_PORT=3306
DB_DATABASE=brianmax_hideout-forum
DB_USERNAME=brianmax_hideoutuser
DB_PASSWORD=TU_PASSWORD_REAL
```

Generar `APP_KEY`:

```bash
php artisan key:generate --force
```

## Preparar base de datos

```bash
php artisan migrate --force
php artisan db:seed --force
```

El seed crea/actualiza el usuario staff:

- Email: `staff@forum.local`
- Password: `change-me-now`

Cambiar esa contrasena apenas ingreses.

## Deploy en HostGator

Opcion recomendada si cPanel te deja elegir document root:

1. Subir la carpeta `hostgator-forum`.
2. Configurar el dominio o subdominio para que apunte a `hostgator-forum/public`.
3. Subir `.env` con los datos reales.
4. Ejecutar:

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Si HostGator solo te deja usar `public_html`:

1. Subir todo el proyecto fuera de `public_html`, por ejemplo en `/home/usuario/hostgator-forum`.
2. Copiar el contenido de `hostgator-forum/public` dentro de `public_html`.
3. Editar `public_html/index.php` para que apunte a:

```php
require __DIR__.'/../hostgator-forum/vendor/autoload.php';
$app = require_once __DIR__.'/../hostgator-forum/bootstrap/app.php';
```

4. Mantener `.env`, `vendor`, `storage`, `app`, `config`, etc. fuera de `public_html`.

## Limpieza de cache

Si cambias `.env` o rutas:

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
