import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, Search, ShieldCheck, UserPlus, Users } from "lucide-react";

import { ConfirmReasonDialog } from "@/components/confirm-reason-dialog";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleBadge, UserAvatar, UserName, getRoleLabel } from "@/components/user-identity";
import {
  deactivateUserAction,
  hideTopicAction,
  reactivateUserAction,
  restoreTopicAction,
  updateUserRoleAction,
} from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { getAdminDashboard } from "@/lib/forum";
import { adminSearchSchema } from "@/lib/validations";
import { canAccessAdmin, canAssignRole, canManageUser, USER_ROLES } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  db: "Falta configurar la base de datos.",
  "invalid-role": "El rol seleccionado no es valido.",
  "self-role": "No puedes quitarte a ti mismo el acceso de administracion.",
  "self-deactivate": "No puedes darte de baja a ti mismo.",
  "invalid-user": "No pudimos encontrar ese usuario.",
  "role-permission": "No tienes permiso para asignar ese rol.",
  "user-permission": "No tienes permiso para gestionar ese usuario.",
  "invalid-topic": "No pudimos actualizar ese tema.",
};

export default async function AdminPage(props: {
  searchParams: Promise<{
    error?: string;
    users?: string;
    userQ?: string;
    userRole?: string;
    userPage?: string;
    topicQ?: string;
    topicPage?: string;
  }>;
}) {
  const [user, queryParams] = await Promise.all([getCurrentUser(), props.searchParams]);
  const query = adminSearchSchema.parse(queryParams);

  if (!user) redirect("/login");
  if (!canAccessAdmin(user.role)) redirect("/");

  const dashboard = await getAdminDashboard(query);
  if (!dashboard) {
    return (
      <section className="rounded-md border border-amber-400/40 bg-amber-400/10 p-6">
        <h1 className="text-2xl font-bold text-stone-50">Falta configurar la base de datos</h1>
      </section>
    );
  }

  const makeHref = (updates: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams();
    if (query.userQ) params.set("userQ", query.userQ);
    if (query.userRole) params.set("userRole", query.userRole);
    if (query.userPage > 1) params.set("userPage", String(query.userPage));
    if (query.topicQ) params.set("topicQ", query.topicQ);
    if (query.topicPage > 1) params.set("topicPage", String(query.topicPage));

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined || value === "" || value === 1) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }

    const serialized = params.toString();
    return serialized ? `/admin?${serialized}` : "/admin";
  };

  const returnTo = makeHref({});

  return (
    <div className="grid gap-8">
      <section className="rounded-md border border-stone-800 bg-stone-950/95 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-lime-300">Panel privado</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-stone-50">
              <ShieldCheck aria-hidden="true" size={28} />
              Administracion
            </h1>
          </div>
          <RoleBadge role={user.role} />
        </div>

        {queryParams.error ? (
          <p className="mt-5 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {errorMessages[queryParams.error] ?? "No pudimos completar la accion."}
          </p>
        ) : null}
        {queryParams.users === "updated" ? (
          <p className="mt-5 rounded-md border border-lime-300/40 bg-lime-300/10 px-3 py-2 text-sm text-lime-200">
            Usuario actualizado.
          </p>
        ) : null}
      </section>

      <section className="rounded-md border border-stone-800 bg-stone-950/95 p-6" aria-labelledby="users-title">
        <h2 id="users-title" className="flex items-center gap-2 text-xl font-bold text-stone-50">
          <Users aria-hidden="true" size={20} />
          Usuarios
        </h2>

        <form action="/admin" className="mt-5 grid gap-2 lg:grid-cols-[1fr_14rem_auto]">
          <input name="topicQ" type="hidden" value={query.topicQ} />
          <input name="topicPage" type="hidden" value={query.topicPage} />
          <label className="sr-only" htmlFor="user-admin-search">
            Buscar usuarios por nombre o mail
          </label>
          <Input
            defaultValue={query.userQ}
            id="user-admin-search"
            maxLength={80}
            name="userQ"
            placeholder="Buscar por nombre o mail"
            type="search"
          />
          <label className="sr-only" htmlFor="user-role-filter">
            Filtrar por rango
          </label>
          <select
            className="h-10 w-full rounded-md border border-stone-700 bg-stone-950 px-3 text-sm text-stone-100 outline-none transition-colors focus:border-lime-300 focus:ring-2 focus:ring-lime-300/20"
            defaultValue={query.userRole}
            id="user-role-filter"
            name="userRole"
          >
            <option value="">Todos los rangos</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {getRoleLabel(role)}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            <Search aria-hidden="true" size={16} />
            Filtrar
          </Button>
        </form>

        <div className="mt-5 divide-y divide-stone-800 overflow-hidden rounded-md border border-stone-800">
          {dashboard.users.map((account) => (
            <article
              className="grid items-center gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_18rem_10rem_8rem]"
              key={account.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar avatarUrl={account.avatarUrl} name={account.name} />
                <div className="min-w-0">
                  <p className="truncate">
                    <UserName name={account.name} role={account.role} />
                  </p>
                  <p className="truncate text-sm text-stone-500">{account.email}</p>
                  {!account.active ? (
                    <p className="mt-1 text-xs font-semibold uppercase text-red-300">
                      Baja logica
                      {account.deactivationReason ? ` - ${account.deactivationReason}` : null}
                    </p>
                  ) : null}
                </div>
              </div>

              <form action={updateUserRoleAction} className="flex items-center gap-2 self-center">
                <input name="userId" type="hidden" value={account.id} />
                <input name="returnTo" type="hidden" value={returnTo} />
                <label className="sr-only" htmlFor={`role-${account.id}`}>
                  Rol de {account.name}
                </label>
                <select
                  className="h-10 w-full rounded-md border border-stone-700 bg-stone-950 px-3 text-sm text-stone-100 outline-none transition-colors focus:border-lime-300 focus:ring-2 focus:ring-lime-300/20"
                  defaultValue={account.role}
                  disabled={!canAssignRole(user.role, account.role, account.role)}
                  id={`role-${account.id}`}
                  name="role"
                >
                  {USER_ROLES.map((role) => (
                    <option
                      disabled={!canAssignRole(user.role, account.role, role)}
                      key={role}
                      value={role}
                    >
                      {getRoleLabel(role)}
                    </option>
                  ))}
                </select>
                <Button
                  disabled={!canAssignRole(user.role, account.role, account.role)}
                  size="sm"
                  type="submit"
                  variant="secondary"
                >
                  Guardar
                </Button>
              </form>

              {account.active ? (
                <div className="self-center">
                  <ConfirmReasonDialog
                    action={deactivateUserAction}
                    disabled={account.id === user.id || !canManageUser(user.role, account.role)}
                    hiddenFields={{ userId: account.id, returnTo }}
                    title={`Dar de baja a ${account.name}`}
                    description="El usuario no podra iniciar sesion y sus sesiones activas se cerraran."
                    reasonPlaceholder="Motivo de baja"
                    triggerLabel="Dar de baja"
                    confirmLabel="Confirmar baja"
                  />
                </div>
              ) : (
                <form action={reactivateUserAction} className="self-center">
                  <input name="userId" type="hidden" value={account.id} />
                  <input name="returnTo" type="hidden" value={returnTo} />
                  <Button
                    disabled={account.id === user.id || !canManageUser(user.role, account.role)}
                    size="sm"
                    type="submit"
                    variant="primary"
                  >
                    <UserPlus aria-hidden="true" size={16} />
                    Dar de alta
                  </Button>
                </form>
              )}

              <p className="self-center text-sm text-stone-500 lg:text-right">
                {account._count.topics} temas
                <br />
                {account._count.posts} respuestas
              </p>
            </article>
          ))}
        </div>

        <Pagination
          currentPage={dashboard.userPage}
          getHref={(page) => makeHref({ userPage: page })}
          label="Paginacion de usuarios"
          totalPages={dashboard.userTotalPages}
        />
      </section>

      <section className="rounded-md border border-stone-800 bg-stone-950/95 p-6" aria-labelledby="topics-title">
        <h2 id="topics-title" className="text-xl font-bold text-stone-50">
          Temas y moderacion
        </h2>

        <form action="/admin" className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input name="userQ" type="hidden" value={query.userQ} />
          <input name="userRole" type="hidden" value={query.userRole} />
          <input name="userPage" type="hidden" value={query.userPage} />
          <label className="sr-only" htmlFor="topic-admin-search">
            Buscar temas por nombre
          </label>
          <Input
            defaultValue={query.topicQ}
            id="topic-admin-search"
            maxLength={80}
            name="topicQ"
            placeholder="Buscar tema por nombre"
            type="search"
          />
          <Button type="submit" variant="secondary">
            <Search aria-hidden="true" size={16} />
            Buscar
          </Button>
        </form>

        <div className="mt-5 grid gap-4">
          {dashboard.topics.map((topic) => {
            const isHidden = topic.status === "ARCHIVED";

            return (
              <article
                className="rounded-md border border-stone-800 bg-stone-900/50 p-4"
                key={topic.id}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-lime-300">
                      {topic.category.name}
                    </p>
                    <Link
                      className="mt-1 block text-lg font-bold text-stone-50 hover:text-lime-300"
                      href={`/topics/${topic.slug}`}
                    >
                      {topic.title}
                    </Link>
                    <p className="mt-2 text-sm text-stone-500">
                      {topic._count.posts} respuestas -{" "}
                      <UserName name={topic.author.name} role={topic.author.role} />
                    </p>
                    {isHidden ? (
                      <p className="mt-2 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
                        Oculto para usuarios. {topic.hiddenReason ? `Motivo: ${topic.hiddenReason}` : null}
                      </p>
                    ) : null}
                  </div>

                  {isHidden ? (
                    <form action={restoreTopicAction}>
                      <input name="id" type="hidden" value={topic.id} />
                      <input name="returnTo" type="hidden" value={returnTo} />
                      <Button size="sm" type="submit" variant="primary">
                        <Eye aria-hidden="true" size={16} />
                        Restaurar
                      </Button>
                    </form>
                  ) : (
                    <ConfirmReasonDialog
                      action={hideTopicAction}
                      hiddenFields={{ id: topic.id, returnTo }}
                      title={`Ocultar ${topic.title}`}
                      description="El tema quedara oculto para usuarios normales y solo sera visible para Staff y Admin+."
                      reasonPlaceholder="Motivo interno"
                      triggerLabel="Ocultar"
                      confirmLabel="Confirmar ocultamiento"
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <Pagination
          currentPage={dashboard.topicPage}
          getHref={(page) => makeHref({ topicPage: page })}
          label="Paginacion de temas en administracion"
          totalPages={dashboard.topicTotalPages}
        />
      </section>
    </div>
  );
}
