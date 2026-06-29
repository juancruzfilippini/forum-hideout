import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, MessageCircle, Pin } from "lucide-react";

import { ConfirmReasonDialog } from "@/components/confirm-reason-dialog";
import { TopicAdminMenu } from "@/components/topic-admin-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RoleBadge, UserAvatar, UserName } from "@/components/user-identity";
import {
  createReplyAction,
  hidePostAction,
  hideTopicAction,
  moveTopicAction,
  restorePostAction,
  restoreTopicAction,
} from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { getCategoriesForSelect, getTopicPage } from "@/lib/forum";
import { canAccessAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function TopicPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const user = await getCurrentUser();
  const isAdmin = canAccessAdmin(user?.role);
  const [topic, categories] = await Promise.all([
    getTopicPage(slug, isAdmin),
    isAdmin ? getCategoriesForSelect() : Promise.resolve([]),
  ]);

  if (!topic) notFound();

  return (
    <article className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Ruta" className="text-sm text-stone-400">
          <Link className="hover:text-lime-300" href="/">
            Foro
          </Link>{" "}
          /{" "}
          <Link className="hover:text-lime-300" href={`/categories/${topic.category.slug}`}>
            {topic.category.name}
          </Link>
        </nav>
        <Button asChild variant="secondary">
          <Link href={`/categories/${topic.category.slug}`}>
            <ArrowLeft aria-hidden="true" size={16} />
            Volver
          </Link>
        </Button>
      </div>

      <section className="relative rounded-md border border-stone-800 bg-stone-950 p-6">
        {isAdmin ? (
          <TopicAdminMenu
            categories={categories}
            currentCategorySlug={topic.category.slug}
            hideAction={hideTopicAction}
            moveAction={moveTopicAction}
            restoreAction={restoreTopicAction}
            topic={{
              id: topic.id,
              slug: topic.slug,
              status: topic.status,
              title: topic.title,
            }}
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-lime-300">
          {topic.pinned ? (
            <span className="inline-flex items-center gap-1">
              <Pin aria-hidden="true" size={13} />
              Fijado
            </span>
          ) : null}
          {topic.status !== "OPEN" ? (
            <span className="inline-flex items-center gap-1 text-amber-300">
              <Lock aria-hidden="true" size={13} />
              Cerrado
            </span>
          ) : null}
        </div>

        {topic.status === "ARCHIVED" ? (
          <p className="mt-4 rounded-md border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
            Este tema esta oculto para usuarios.
            {topic.hiddenReason ? ` Motivo: ${topic.hiddenReason}` : null}
          </p>
        ) : null}

        <h1 className="mt-3 text-3xl font-bold text-stone-50">{topic.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <UserAvatar avatarUrl={topic.author.avatarUrl} name={topic.author.name} />
          <div>
            <p className="text-sm text-stone-500">
              por <UserName name={topic.author.name} role={topic.author.role} /> - {topic.views + 1} vistas
            </p>
            <RoleBadge role={topic.author.role} />
          </div>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-stone-300">{topic.body}</p>
      </section>

      <section aria-labelledby="replies-title" className="grid gap-4">
        <h2 id="replies-title" className="flex items-center gap-2 text-xl font-bold text-stone-50">
          <MessageCircle aria-hidden="true" size={20} />
          Respuestas
        </h2>

        {topic.posts.length > 0 ? (
          topic.posts.map((post) => (
            <div
              className={`rounded-md border p-5 ${
                post.hidden
                  ? "border-amber-300/40 bg-amber-300/10"
                  : "border-stone-800 bg-stone-950"
              }`}
              key={post.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  <UserAvatar avatarUrl={post.author.avatarUrl} name={post.author.name} />
                  <div>
                    <p>
                      <UserName name={post.author.name} role={post.author.role} />
                    </p>
                    <RoleBadge role={post.author.role} />
                  </div>
                </div>
                <time className="text-xs text-stone-500" dateTime={post.createdAt.toISOString()}>
                  {post.createdAt.toLocaleDateString("es-AR")}
                </time>
              </div>
              {post.hidden ? (
                <p className="mt-4 rounded-md border border-amber-300/30 bg-stone-950/60 px-3 py-2 text-sm text-amber-100">
                  Respuesta oculta para usuarios.
                  {post.hiddenReason ? ` Motivo: ${post.hiddenReason}` : null}
                </p>
              ) : null}
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-300">{post.body}</p>
              {isAdmin ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800 pt-4">
                  {post.hidden ? (
                    <>
                      <p className="text-sm text-stone-400">Restaurar respuesta la vuelve visible.</p>
                      <form action={restorePostAction}>
                        <input name="id" type="hidden" value={post.id} />
                        <input name="returnTo" type="hidden" value={`/topics/${topic.slug}`} />
                        <Button size="sm" type="submit" variant="primary">
                          Restaurar respuesta
                        </Button>
                      </form>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-stone-400">Moderacion de respuesta</p>
                      <ConfirmReasonDialog
                        action={hidePostAction}
                        hiddenFields={{ id: post.id, returnTo: `/topics/${topic.slug}` }}
                        title="Ocultar respuesta"
                        description="La respuesta quedara oculta para usuarios normales y solo sera visible para Staff y Admin+."
                        reasonPlaceholder="Motivo interno para ocultar respuesta"
                        triggerLabel="Ocultar respuesta"
                        confirmLabel="Confirmar ocultamiento"
                      />
                    </>
                  )}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-md border border-stone-800 bg-stone-950 p-5 text-sm text-stone-400">
            Aun no hay respuestas.
          </p>
        )}
      </section>

      <section className="rounded-md border border-stone-800 bg-stone-950 p-6">
        {user && topic.status === "OPEN" ? (
          <form action={createReplyAction} className="grid gap-4">
            <input name="topicId" type="hidden" value={topic.id} />
            <label className="grid gap-2 text-sm font-medium text-stone-300">
              Responder como <UserName name={user.name} role={user.role} />
              <Textarea maxLength={6000} minLength={4} name="body" required rows={6} />
            </label>
            <Button className="w-fit" type="submit">
              Publicar respuesta
            </Button>
          </form>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-stone-50">
              {topic.status === "OPEN" ? "Inicia sesion para responder" : "Tema cerrado"}
            </h2>
            {topic.status === "OPEN" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/register">Crear cuenta</Link>
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </article>
  );
}
