import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";

import { CategoryPicker } from "@/components/category-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTopicAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { getCategoriesForSelect } from "@/lib/forum";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  db: "Falta configurar la base de datos.",
  invalid: "Revisa el titulo, la categoria y el mensaje.",
  category: "La categoria seleccionada no existe.",
};

export default async function NewTopicPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, user, categories] = await Promise.all([
    props.searchParams,
    getCurrentUser(),
    getCategoriesForSelect(),
  ]);

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl rounded-md border border-stone-800 bg-stone-950 p-6">
        <h1 className="text-2xl font-bold text-stone-50">Necesitas iniciar sesion</h1>
        <p className="mt-2 text-sm leading-6 text-stone-400">
          Crea una cuenta o entra para publicar un tema nuevo.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register">Crear cuenta</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl rounded-md border border-stone-800 bg-stone-950 p-6">
      <h1 className="text-2xl font-bold text-stone-50">Nuevo tema</h1>
      <p className="mt-2 text-sm leading-6 text-stone-400">
        Elige una categoria clara y agrega suficiente contexto para que otros usuarios puedan responder.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {errorMessages[error] ?? errorMessages.invalid}
        </p>
      ) : null}

      <form action={createTopicAction} className="mt-6 grid gap-4">
        <CategoryPicker categories={categories} />

        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Titulo
          <Input maxLength={120} minLength={6} name="title" required />
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Mensaje
          <Textarea maxLength={8000} minLength={20} name="body" required rows={10} />
        </label>

        <Button className="w-fit" type="submit">
          <MessageSquarePlus aria-hidden="true" size={16} />
          Publicar
        </Button>
      </form>
    </section>
  );
}
