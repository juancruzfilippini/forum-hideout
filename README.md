# Forum Hideout

Forum app for the Zombie Hideout community.

## Setup

1. Copy `.env.example` to `.env`.
2. Adjust `DATABASE_URL` if your Laragon MariaDB credentials differ.
3. Run:

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The default local database is `forum_hideout`.

## Main Features

- Register and log in with email and password.
- Session cookies stored server-side.
- Categories, topics, and replies backed by Prisma/MariaDB.
- Server Actions for all mutations.
- Server Components by default.
