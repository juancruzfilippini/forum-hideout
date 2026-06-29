import Link from "next/link";
import { KeyRound, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar, UserName } from "@/components/user-identity";
import { changePasswordAction, updateProfileAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const profileErrors: Record<string, string> = {
  db: "Falta configurar la base de datos.",
  invalid: "Revisa el nombre e intenta de nuevo.",
  "avatar-size": "La imagen debe pesar menos de 2 MB.",
  "avatar-type": "Usa una imagen JPG, PNG, WEBP o GIF.",
};

const passwordErrors: Record<string, string> = {
  db: "Falta configurar la base de datos.",
  invalid: "Revisa las contrasenas e intenta de nuevo.",
  current: "La contrasena actual no es correcta.",
};

const sampleRoles = [
  { name: "Miembro", role: "MEMBER" },
  { name: "VIP", role: "VIP" },
  { name: "VIP", role: "VIP_PLUS" },
  { name: "Admin", role: "ADMIN" },
  { name: "Admin", role: "ADMIN_PLUS" },
  { name: "Staff", role: "STAFF" },
];

export default async function ProfilePage(props: {
  searchParams: Promise<{
    profile?: string;
    profileError?: string;
    password?: string;
    passwordError?: string;
  }>;
}) {
  const [user, query] = await Promise.all([getCurrentUser(), props.searchParams]);

  if (!user) {
    return (
      <section className="mx-auto max-w-xl rounded-md border border-stone-800 bg-stone-950/95 p-6">
        <h1 className="text-2xl font-bold text-stone-50">Necesitas iniciar sesion</h1>
        <p className="mt-2 text-sm text-stone-400">Entra para administrar tu perfil.</p>
        <Button asChild className="mt-5">
          <Link href="/login">Entrar</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section className="rounded-md border border-stone-800 bg-stone-950/95 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <UserAvatar avatarUrl={user.avatarUrl} className="size-20" name={user.name} />
          <div>
            <p className="text-sm font-semibold uppercase text-lime-300">Tu perfil</p>
            <h1 className="mt-1 text-3xl font-bold">
              <UserName name={user.name} role={user.role} />
            </h1>
            <p className="mt-1 text-sm text-stone-400">{user.email}</p>
          </div>
        </div>

        {query.profile === "updated" ? (
          <p className="mt-5 rounded-md border border-lime-300/40 bg-lime-300/10 px-3 py-2 text-sm text-lime-200">
            Perfil actualizado.
          </p>
        ) : null}
        {query.profileError ? (
          <p className="mt-5 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {profileErrors[query.profileError] ?? profileErrors.invalid}
          </p>
        ) : null}

        <form action={updateProfileAction} className="mt-6 grid gap-4" encType="multipart/form-data">
          <label className="grid gap-2 text-sm font-medium text-stone-300">
            Nombre visible
            <Input defaultValue={user.name} maxLength={40} minLength={2} name="name" required />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-300">
            Foto de perfil
            <Input accept="image/jpeg,image/png,image/webp,image/gif" name="avatar" type="file" />
            <span className="text-xs font-normal text-stone-500">Maximo 2 MB.</span>
          </label>

          <Button className="w-fit" type="submit">
            <Save aria-hidden="true" size={16} />
            Guardar perfil
          </Button>
        </form>
      </section>

      <aside className="rounded-md border border-stone-800 bg-stone-950/95 p-6">
        <h2 className="text-lg font-bold text-stone-50">Roles visibles</h2>
        <div className="mt-4 grid gap-3">
          {sampleRoles.map((role) => (
            <div className="rounded-md border border-stone-800 bg-stone-900/60 px-3 py-2" key={role.role}>
              <UserName name={role.name} role={role.role} />
            </div>
          ))}
        </div>
      </aside>

      <section className="rounded-md border border-stone-800 bg-stone-950/95 p-6 lg:col-span-2">
        <div className="flex items-center gap-2">
          <KeyRound aria-hidden="true" className="text-lime-300" size={20} />
          <h2 className="text-xl font-bold text-stone-50">Cambiar contrasena</h2>
        </div>

        {query.password === "changed" ? (
          <p className="mt-5 rounded-md border border-lime-300/40 bg-lime-300/10 px-3 py-2 text-sm text-lime-200">
            Contrasena actualizada.
          </p>
        ) : null}
        {query.passwordError ? (
          <p className="mt-5 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {passwordErrors[query.passwordError] ?? passwordErrors.invalid}
          </p>
        ) : null}

        <form action={changePasswordAction} className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-stone-300">
            Actual
            <Input autoComplete="current-password" name="currentPassword" required type="password" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-300">
            Nueva
            <Input autoComplete="new-password" minLength={8} name="newPassword" required type="password" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-300">
            Repetir nueva
            <Input autoComplete="new-password" minLength={8} name="confirmPassword" required type="password" />
          </label>
          <Button className="w-fit md:col-span-3" type="submit">
            <KeyRound aria-hidden="true" size={16} />
            Actualizar contrasena
          </Button>
        </form>
      </section>
    </div>
  );
}
