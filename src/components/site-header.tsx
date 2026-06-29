import Link from "next/link";
import { LogOut, MessageSquarePlus, Shield, SlidersHorizontal, UserCircle } from "lucide-react";

import { logoutAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { UserName } from "@/components/user-identity";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-stone-800 bg-stone-950/95">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex size-10 items-center justify-center rounded-md border border-lime-300/40 bg-lime-300 text-stone-950">
            <Shield aria-hidden="true" size={22} />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-normal text-stone-50">Forum Hideout</span>
            <span className="block text-xs text-stone-400">Comunidad del servidor</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary">
            <Link href="/new-topic">
              <MessageSquarePlus aria-hidden="true" size={16} />
              Nuevo tema
            </Link>
          </Button>

          {user ? (
            <div className="flex flex-wrap items-center gap-2">
              {canAccessAdmin(user.role) ? (
                <Button asChild variant="secondary">
                  <Link href="/admin">
                    <SlidersHorizontal aria-hidden="true" size={16} />
                    Administracion
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="ghost">
                <Link href="/profile">
                  <UserCircle aria-hidden="true" size={16} />
                  Perfil
                </Link>
              </Button>
              <span className="hidden text-sm text-stone-400 sm:inline">
                Hola, <UserName name={user.name} role={user.role} />
              </span>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost">
                  <LogOut aria-hidden="true" size={16} />
                  Salir
                </Button>
              </form>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Crear cuenta</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
