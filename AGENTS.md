# Forum Hideout Agent Guide

## Project Shape

- Next.js 16 App Router lives in `app/`.
- Shared application code lives in `src/`.
- Prisma schema and migrations live in `prisma/`.

## Architecture Rules

- Treat Server Components as the default.
- Add `"use client"` only for browser APIs, state, effects, or rich client interactions.
- Route params are promises in this Next version. Await `params` in pages/layouts.
- Do not expose secrets in client code. Only `NEXT_PUBLIC_*` variables may reach the browser.
- Validate all user input with Zod on the server.
- Keep auth checks inside every Server Action that mutates forum data.

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm format`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm db:studio`

If `pnpm prisma` does not resolve on Windows PowerShell, use `.\node_modules\.bin\prisma.cmd`.

## Style

- TypeScript strict mode is required.
- Avoid `any`; prefer explicit types or `unknown` with narrowing.
- Use shadcn-style primitives from `src/components/ui`.
- Use Lucide icons for common actions.
- Preserve accessibility: semantic landmarks, visible focus, labels, keyboard navigation, and `aria-live` for form feedback.
- Keep visual effects subtle and honor `prefers-reduced-motion`.
