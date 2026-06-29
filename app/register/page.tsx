import Link from "next/link";
import { UserPlus } from "lucide-react";

import { registerAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const errorMessages: Record<string, string> = {
  db: "Falta configurar la base de datos.",
  exists: "Ya existe una cuenta con ese email.",
  invalid: "Revisa los campos e intenta de nuevo.",
};

export default async function RegisterPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await props.searchParams;

  return (
    <section className="mx-auto max-w-md rounded-md border border-stone-800 bg-stone-950 p-6">
      <h1 className="text-2xl font-bold text-stone-50">Crear cuenta</h1>
      <p className="mt-2 text-sm leading-6 text-stone-400">
        Elige un nombre visible para participar en el foro.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {errorMessages[error] ?? errorMessages.invalid}
        </p>
      ) : null}

      <form action={registerAction} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Nombre visible
          <Input autoComplete="nickname" maxLength={40} minLength={2} name="name" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Email
          <Input autoComplete="email" name="email" required type="email" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Contrasena
          <Input autoComplete="new-password" minLength={8} name="password" required type="password" />
        </label>
        <Button type="submit">
          <UserPlus aria-hidden="true" size={16} />
          Crear cuenta
        </Button>
      </form>

      <p className="mt-5 text-sm text-stone-400">
        Ya tienes cuenta?{" "}
        <Link className="font-semibold text-lime-300 hover:text-lime-200" href="/login">
          Entrar
        </Link>
      </p>
    </section>
  );
}
