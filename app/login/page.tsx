import Link from "next/link";
import { LogIn } from "lucide-react";

import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await props.searchParams;

  return (
    <section className="mx-auto max-w-md rounded-md border border-stone-800 bg-stone-950 p-6">
      <h1 className="text-2xl font-bold text-stone-50">Entrar</h1>
      <p className="mt-2 text-sm leading-6 text-stone-400">
        Usa tu cuenta del foro para publicar temas y responder.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          No pudimos iniciar sesion con esos datos.
        </p>
      ) : null}

      <form action={loginAction} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Email
          <Input autoComplete="email" name="email" required type="email" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Contrasena
          <Input autoComplete="current-password" name="password" required type="password" />
        </label>
        <Button type="submit">
          <LogIn aria-hidden="true" size={16} />
          Entrar
        </Button>
      </form>

      <p className="mt-5 text-sm text-stone-400">
        No tienes cuenta?{" "}
        <Link className="font-semibold text-lime-300 hover:text-lime-200" href="/register">
          Crear cuenta
        </Link>
      </p>
    </section>
  );
}
