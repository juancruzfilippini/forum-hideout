import Link from "next/link";
import { MessageCircle, Pin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserName } from "@/components/user-identity";
import { getForumHome, getRecentTopics, searchTopics } from "@/lib/forum";
import { searchSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export default async function HomePage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = searchSchema.parse(await props.searchParams).q;
  const [categories, recentTopics, searchResults] = await Promise.all([
    getForumHome(),
    getRecentTopics(),
    searchTopics(query),
  ]);

  if (!categories) {
    return (
      <section className="rounded-md border border-amber-400/40 bg-amber-400/10 p-6">
        <h1 className="text-2xl font-bold text-stone-50">Falta configurar la base de datos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
          Copia `.env.example` a `.env`, revisa `DATABASE_URL` y ejecuta `pnpm db:migrate`
          seguido de `pnpm db:seed`.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <section aria-labelledby="categories-title">
        <div className="mb-5">
          <div>
            <p className="text-sm font-semibold uppercase text-lime-300">Foro</p>
            <h1 id="categories-title" className="mt-1 text-3xl font-bold text-stone-50">
              Categorias de la comunidad
            </h1>
          </div>

          <form action="/" className="mt-5 flex max-w-2xl flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="forum-search">
              Buscar temas en todas las categorias
            </label>
            <Input
              defaultValue={query}
              id="forum-search"
              maxLength={80}
              name="q"
              placeholder="Buscar temas en todo el foro"
              type="search"
            />
            <Button type="submit" variant="secondary">
              <Search aria-hidden="true" size={16} />
              Buscar
            </Button>
          </form>
        </div>

        {query ? (
          <section className="mb-6 rounded-md border border-stone-800 bg-stone-950/95 p-5" aria-labelledby="search-title">
            <h2 id="search-title" className="text-xl font-bold text-stone-50">
              Resultados para &ldquo;{query}&rdquo;
            </h2>
            <div className="mt-4 grid gap-3">
              {searchResults.length > 0 ? (
                searchResults.map((topic) => (
                  <Link
                    className="rounded-md border border-stone-800 bg-stone-900/60 p-4 hover:border-lime-300/60"
                    href={`/topics/${topic.slug}`}
                    key={topic.id}
                  >
                    <span className="text-xs font-semibold uppercase text-lime-300">
                      {topic.category.name}
                    </span>
                    <span className="mt-1 block text-lg font-bold text-stone-50">{topic.title}</span>
                    <span className="mt-2 block text-sm text-stone-500">
                      {topic._count.posts} respuestas -{" "}
                      <UserName name={topic.author.name} role={topic.author.role} />
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-stone-400">No encontramos temas con esa busqueda.</p>
              )}
            </div>
          </section>
        ) : null}

        <div className="divide-y divide-stone-800 rounded-md border border-stone-800 bg-stone-950">
          {categories.map((category) => {
            const latestTopic = category.topics[0];

            return (
              <article
                className="relative isolate grid gap-4 p-5 transition-colors hover:bg-stone-900/70 md:grid-cols-[1fr_8rem_14rem]"
                key={category.id}
              >
                <Link
                  aria-label={`Ingresar a ${category.name}`}
                  className="absolute inset-0 z-0"
                  href={`/categories/${category.slug}`}
                />
                <div className="pointer-events-none relative z-10">
                  <h2 className="text-xl font-bold text-stone-50">{category.name}</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-400">{category.description}</p>
                </div>

                <div className="pointer-events-none relative z-10 flex items-center gap-2 text-sm text-stone-400 md:justify-center">
                  <MessageCircle aria-hidden="true" size={16} />
                  {category._count.topics} temas
                </div>

                <div className="pointer-events-none relative z-10 text-sm text-stone-400">
                  {latestTopic ? (
                    <>
                      <Link
                        className="pointer-events-auto relative z-20 line-clamp-1 font-semibold text-stone-200 hover:text-lime-300"
                        href={`/topics/${latestTopic.slug}`}
                      >
                        {latestTopic.pinned ? <Pin aria-label="Fijado" className="mr-1 inline" size={13} /> : null}
                        {latestTopic.title}
                      </Link>
                      <p className="mt-1">
                        por <UserName name={latestTopic.author.name} role={latestTopic.author.role} />
                      </p>
                    </>
                  ) : (
                    <span>Sin temas todavia</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside aria-labelledby="recent-title" className="lg:pt-[5.7rem]">
        <div className="rounded-md border border-stone-800 bg-stone-950 p-5">
          <h2 id="recent-title" className="text-lg font-bold text-stone-50">
            Actividad reciente
          </h2>
          <div className="mt-4 grid gap-4">
            {recentTopics.map((topic) => (
              <Link
                className="block rounded-md border border-stone-800 bg-stone-900/50 p-3 hover:border-lime-300/60"
                href={`/topics/${topic.slug}`}
                key={topic.id}
              >
                <span className="text-xs font-semibold uppercase text-lime-300">
                  {topic.category.name}
                </span>
                <span className="mt-1 block text-sm font-semibold text-stone-100">{topic.title}</span>
                <span className="mt-2 block text-xs text-stone-500">
                  {topic._count.posts} respuestas -{" "}
                  <UserName name={topic.author.name} role={topic.author.role} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
