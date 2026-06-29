import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-md border border-stone-800 bg-stone-950 p-6 text-center">
      <h1 className="text-2xl font-bold text-stone-50">No encontramos esa pagina</h1>
      <p className="mt-2 text-sm text-stone-400">Puede que el tema o la categoria ya no exista.</p>
      <Button asChild className="mt-5">
        <Link href="/">Volver al foro</Link>
      </Button>
    </section>
  );
}
