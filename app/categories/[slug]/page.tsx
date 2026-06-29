import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Pin, Search } from "lucide-react";

import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserName } from "@/components/user-identity";
import { getCategoryPage } from "@/lib/forum";
import { categorySearchSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const [{ slug }, queryParams] = await Promise.all([props.params, props.searchParams]);
  const { q: query, page } = categorySearchSchema.parse(queryParams);
  const category = await getCategoryPage(slug, query, page);

  if (!category) notFound();

  return (
    <section>
      <div className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase text-lime-300">Categoria</p>
            <h1 className="mt-1 text-3xl font-bold text-stone-50">{category.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">{category.description}</p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/">
              <ArrowLeft aria-hidden="true" size={16} />
              Volver
            </Link>
          </Button>
        </div>

        <form className="mt-5 flex max-w-2xl flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="category-search">
            Buscar temas en {category.name}
          </label>
          <Input
            defaultValue={query}
            id="category-search"
            maxLength={80}
            name="q"
            placeholder={`Buscar temas en ${category.name}`}
            type="search"
          />
          <Button type="submit" variant="secondary">
            <Search aria-hidden="true" size={16} />
            Buscar
          </Button>
        </form>
      </div>

      <div className="divide-y divide-stone-800 rounded-md border border-stone-800 bg-stone-950">
        {category.topics.length > 0 ? (
          category.topics.map((topic) => (
            <article
              className="relative isolate grid gap-4 p-5 transition-colors hover:bg-stone-900/70 md:grid-cols-[1fr_10rem]"
              key={topic.id}
            >
              <Link
                aria-label={`Ingresar a ${topic.title}`}
                className="absolute inset-0 z-0"
                href={`/topics/${topic.slug}`}
              />
              <div className="pointer-events-none relative z-10">
                <h2 className="text-xl font-bold text-stone-50">
                  {topic.pinned ? <Pin aria-label="Fijado" className="mr-1 inline" size={14} /> : null}
                  {topic.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-400">{topic.body}</p>
                <p className="mt-3 text-xs text-stone-500">
                  por <UserName name={topic.author.name} role={topic.author.role} />
                </p>
              </div>

              <div className="pointer-events-none relative z-10 flex items-center gap-2 text-sm text-stone-400 md:justify-end">
                <MessageCircle aria-hidden="true" size={16} />
                {topic._count.posts} respuestas
              </div>
            </article>
          ))
        ) : (
          <div className="p-6">
            <h2 className="text-lg font-bold text-stone-50">
              {query ? "No encontramos temas" : "Todavia no hay temas"}
            </h2>
            <p className="mt-2 text-sm text-stone-400">
              {query
                ? "Prueba con otras palabras dentro de esta categoria."
                : "Puedes abrir la primera conversacion."}
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={category.currentPage}
        getHref={(nextPage) => {
          const params = new URLSearchParams();
          if (query) params.set("q", query);
          params.set("page", String(nextPage));
          return `/categories/${category.slug}?${params.toString()}`;
        }}
        label={`Paginacion de temas de ${category.name}`}
        totalPages={category.totalPages}
      />
    </section>
  );
}
